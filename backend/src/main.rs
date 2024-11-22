mod auth;
mod config;
mod database;
mod manage;
mod routes;
mod utils;
use database::relational;
use rocket::launch;
use std::sync::Arc;
use tokio::sync::Mutex;
use utils::{AppResult, CustomError, CustomResult};

struct AppState {
    db: Arc<Mutex<Option<relational::Database>>>,
    configure: Arc<Mutex<config::Config>>,
}

impl AppState {
    async fn get_sql(&self) -> CustomResult<relational::Database> {
        self.db
            .lock()
            .await
            .clone()
            .ok_or_else(|| CustomError::from_str("Database not initialized"))
    }

    async fn link_sql(&self, config: &config::SqlConfig) -> CustomResult<()> {
        let database = relational::Database::link(config).await?;
        *self.db.lock().await = Some(database);
        Ok(())
    }
}

#[launch]
async fn rocket() -> _ {
    let config = config::Config::read().expect("Failed to read config");

    let state = AppState {
        db: Arc::new(Mutex::new(None)),
        configure: Arc::new(Mutex::new(config.clone())),
    };

    let mut rocket_builder = rocket::build().manage(state);

    if config.info.install {
        if let Some(state) = rocket_builder.state::<AppState>() {
            state
                .link_sql(&config.sql_config)
                .await
                .expect("Failed to connect to database");
        }
    } else {
        rocket_builder = rocket_builder.mount("/", rocket::routes![routes::intsall::install]);
    }

    rocket_builder = rocket_builder.mount("/auth/token", routes::jwt_routes());

    rocket_builder
}
