mod security;
mod common;
mod storage;
mod api;

use storage::sql;
use common::error::{CustomErrorInto, CustomResult};
use rocket::Shutdown;
use std::sync::Arc;
use tokio::sync::Mutex;
use crate::common::config;
pub struct AppState {
    db: Arc<Mutex<Option<sql::Database>>>,
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

    pub async fn sql_get(&self) -> CustomResult<sql::Database> {
        self.db
            .lock()
            .await
            .clone()
            .ok_or_else(|| "数据库未连接".into_custom_error())
    }

    pub async fn sql_link(&self, config: &config::SqlConfig) -> CustomResult<()> {
        *self.db.lock().await = Some(sql::Database::link(config).await?);
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
            .ok_or_else(|| "未能获取rocket的shutdown".into_custom_error())?
            .notify();
        Ok(())
    }
}

#[rocket::main]
async fn main() -> CustomResult<()> {
    let config = config::Config::read().unwrap_or_default();
    let state = Arc::new(AppState::new());

    let rocket_config = rocket::Config::figment()
        .merge(("address", config.address))
        .merge(("port", config.port));

    let mut rocket_builder = rocket::build()
        .configure(rocket_config)
        .manage(state.clone());

    if !config.info.install {
        rocket_builder = rocket_builder.mount("/", rocket::routes![api::setup::install]);
    } else {
        state.sql_link(&config.sql_config).await?;
        rocket_builder = rocket_builder
            .mount("/auth/token", api::jwt_routes())
            .mount("/config", api::configure_routes());
    }

    let rocket = rocket_builder.ignite().await?;

    rocket
        .state::<Arc<AppState>>()
        .ok_or_else(|| "未能获取AppState".into_custom_error())?
        .set_shutdown(rocket.shutdown())
        .await;

    rocket.launch().await?;

    if *state.restart_progress.lock().await {
        if let Ok(current_exe) = std::env::current_exe() {
            let _ = std::process::Command::new(current_exe).spawn();
        }
    }
    std::process::exit(0);
}
