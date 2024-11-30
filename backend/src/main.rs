mod api;
mod common;
mod security;
mod storage;

use crate::common::config;
use common::error::{CustomErrorInto, CustomResult};
use rocket::Shutdown;
use std::sync::Arc;
use storage::sql;
use tokio::sync::Mutex;
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
        match sql::Database::link(config).await {
            Ok(db) => {
                *self.db.lock().await = Some(db);
                Ok(())
            }
            Err(e) => {
                Err(e)
            }
        }
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
    let config = config::Config::read().unwrap_or_else(|e| {
        eprintln!("配置读取失败: {}", e);
        config::Config::default()
    });
    let state = Arc::new(AppState::new());

    let rocket_config = rocket::Config::figment()
        .merge(("address", config.address))
        .merge(("port", config.port));

    let mut rocket_builder = rocket::build()
        .configure(rocket_config)
        .manage(state.clone());

    if !config.init.sql {
        rocket_builder = rocket_builder.mount("/", rocket::routes![api::setup::setup_sql]);
    } else if !config.init.administrator {
        rocket_builder = rocket_builder.mount("/", rocket::routes![api::setup::setup_account]);
    } else {
        state.sql_link(&config.sql_config).await?;
        rocket_builder = rocket_builder
            .mount("/auth/token", api::jwt_routes())
            .mount("/config", api::configure_routes());
    }

    let rocket = rocket_builder.ignite().await?;

    rocket
        .state::<Arc<AppState>>()
        .ok_or_else(|| "无法获取AppState".into_custom_error())?
        .set_shutdown(rocket.shutdown())
        .await;

    rocket.launch().await?;

    if *state.restart_progress.lock().await {
        if let Ok(current_exe) = std::env::current_exe() {
            match std::process::Command::new(current_exe).spawn() {
                Ok(_) => println!("成功启动新进程"),
                Err(e) => eprintln!("启动新进程失败: {}", e),
            };
        } else {
            eprintln!("获取当前可执行文件路径失败");
        }
    }
    
    std::process::exit(0);
}
