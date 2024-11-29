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
    restart_attempts: Arc<Mutex<u32>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            db: Arc::new(Mutex::new(None)),
            shutdown: Arc::new(Mutex::new(None)),
            restart_progress: Arc::new(Mutex::new(false)),
            restart_attempts: Arc::new(Mutex::new(0)),
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

    pub async fn restart_server(&self) -> CustomResult<()> {
        const MAX_RESTART_ATTEMPTS: u32 = 3;
        const RESTART_DELAY_MS: u64 = 1000;

        let mut attempts = self.restart_attempts.lock().await;
        if *attempts >= MAX_RESTART_ATTEMPTS {
            return Err("达到最大重启尝试次数".into_custom_error());
        }
        *attempts += 1;

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
        tokio::time::sleep(tokio::time::Duration::from_millis(1000)).await;
        
        if let Ok(current_exe) = std::env::current_exe() {
            println!("正在尝试重启服务器...");
            
            let mut command = std::process::Command::new(current_exe);
            command.env("RUST_BACKTRACE", "1");
            
            match command.spawn() {
                Ok(child) => {
                    println!("成功启动新进程 (PID: {})", child.id());
                    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
                }
                Err(e) => {
                    eprintln!("启动新进程失败: {}", e);
                    *state.restart_progress.lock().await = false;
                    return Err(format!("重启失败: {}", e).into_custom_error());
                }
            };
        } else {
            eprintln!("获取当前可执行文件路径失败");
            return Err("重启失败: 无法获取可执行文件路径".into_custom_error());
        }
    }
    
    println!("服务器正常退出");
    std::process::exit(0);
}
