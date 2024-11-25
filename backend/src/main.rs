mod auth;
mod config;
mod database;
mod routes;
mod utils;
use database::relational;
use rocket::Shutdown;
use std::sync::Arc;
use tokio::sync::Mutex;
mod error;
use error::{CustomErrorInto, CustomResult};

pub struct AppState {
    db: Arc<Mutex<Option<relational::Database>>>,
    shutdown: Arc<Mutex<Option<Shutdown>>>,
    restart_progress: Arc<Mutex<bool>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            db: Arc::new(Mutex::new(None)),
            shutdown: Arc::new(Mutex::new(None)),
            restart_progress: Arc::new(Mutex::new(false)),
        }
    }

    pub async fn sql_get(&self) -> CustomResult<relational::Database> {
        self.db
            .lock()
            .await
            .clone()
            .ok_or("数据库未连接".into_custom_error())
    }

    pub async fn sql_link(&self, config: &config::SqlConfig) -> CustomResult<()> {
        let database = relational::Database::link(config).await?;
        *self.db.lock().await = Some(database);
        Ok(())
    }

    pub async fn set_shutdown(&self, shutdown: Shutdown) {
        *self.shutdown.lock().await = Some(shutdown);
    }

    pub async fn trigger_restart(&self) -> CustomResult<()> {
        *self.restart_progress.lock().await = true;

        self.shutdown
            .lock()
            .await
            .take()
            .ok_or("未能获取rocket的shutdown".into_custom_error())?
            .notify();

        Ok(())
    }
}

#[rocket::main]
async fn main() -> CustomResult<()> {
    let config = config::Config::read().unwrap_or_default();

    let rocket_config = rocket::Config::figment()
        .merge(("address", config.address.clone()))
        .merge(("port", config.port));
    let state = AppState::new();

    let state = Arc::new(state);

    let rocket_builder = rocket::build().configure(rocket_config).manage(state.clone());

    let rocket_builder = if !config.info.install {
        rocket_builder.mount("/", rocket::routes![routes::install::install])
    } else {
        state.sql_link(&config.sql_config).await?;
        rocket_builder
            .mount("/auth/token", routes::jwt_routes())
            .mount("/config", routes::configure_routes())
    };

    let rocket = rocket_builder.ignite().await?;

    rocket
        .state::<Arc<AppState>>()
        .ok_or("未能获取AppState".into_custom_error())?
        .set_shutdown(rocket.shutdown())
        .await;

    rocket.launch().await?;

    let restart_progress = *state.restart_progress.lock().await;
    if restart_progress {
        let current_exe = std::env::current_exe()?;
        let _ = std::process::Command::new(current_exe).spawn();
    }
    std::process::exit(0);
}
