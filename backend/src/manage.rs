use rocket::shutdown::Shutdown;
use std::env;
use std::path::Path;
use std::process::{exit, Command};
use tokio::signal;

// 应用管理器
pub struct AppManager {
    shutdown: Shutdown,
    executable_path: String,
}

impl AppManager {
    pub fn new(shutdown: Shutdown) -> Self {
        let executable_path = env::current_exe()
            .expect("Failed to get executable path")
            .to_string_lossy()
            .into_owned();

        Self {
            shutdown,
            executable_path,
        }
    }

    // 优雅关闭
    pub async fn graceful_shutdown(&self) {
        println!("Initiating graceful shutdown...");

        // 触发 Rocket 的优雅关闭
        self.shutdown.notify();

        // 等待一段时间以确保连接正确关闭
        tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
    }

    // 重启应用
    pub async fn restart(&self) -> Result<(), Box<dyn std::error::Error>> {
        println!("Preparing to restart application...");

        // 执行优雅关闭
        self.graceful_shutdown().await;

        // 在新进程中启动应用
        if cfg!(target_os = "windows") {
            Command::new("cmd")
                .args(&["/C", &self.executable_path])
                .spawn()?;
        } else {
            Command::new(&self.executable_path).spawn()?;
        }

        // 退出当前进程
        println!("Application restarting...");
        exit(0);
    }
}
