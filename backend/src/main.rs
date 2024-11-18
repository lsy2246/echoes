// File path: /d:/data/echoes/backend/src/main.rs

/**
 * 主程序入口，提供数据库连接和相关API接口。
 *
 * 接口：
 * - GET /api/install: 测试数据库连接
 * - GET /api/sql: 执行SQL查询并返回结果
 */

mod config; // 配置模块
mod database; // 数据库模块
mod secret; // 密钥模块

use chrono::Duration; // 引入时间持续时间
use database::relational; // 引入关系型数据库
use once_cell::sync::Lazy; // 用于延迟初始化
use rocket::{get, post, http::Status, launch, response::status, routes, serde::json::Json}; // 引入Rocket框架相关功能
use std::sync::Arc; // 引入Arc用于线程安全的引用计数
use tokio::sync::Mutex; // 引入Mutex用于异步锁

// 全局数据库连接变量
static SQL: Lazy<Arc<Mutex<Option<relational::Database>>>> =
    Lazy::new(|| Arc::new(Mutex::new(None)));

/**
 * 初始化数据库连接
 *
 * # 参数
 * - `database`: 数据库配置
 *
 * # 返回
 * - `Result<(), Box<dyn std::error::Error>>`: 初始化结果
 */
async fn init_sql(database: config::SqlConfig) -> Result<(), Box<dyn std::error::Error>> {
    let database = relational::Database::link(database).await?; // 初始化数据库
    *SQL.lock().await = Some(database); // 保存数据库实例
    Ok(())
}

/**
 * 获取数据库的引用
 *
 * # 返回
 * - `Result<relational::Database, Box<dyn std::error::Error>>`: 数据库引用或错误信息
 */
async fn get_sql() -> Result<relational::Database, Box<dyn std::error::Error>> {
    SQL.lock()
        .await
        .clone()
        .ok_or_else(|| "Database not initialized".into()) // 返回错误信息
}

/**
 * 数据库安装接口
 *
 * # 参数
 * - `data`: 数据库配置
 *
 * # 返回
 * - `Result<status::Custom<String>, status::Custom<String>>`: 安装结果
 */
#[post("/install", format = "json", data = "<data>")]
async fn install(data: Json<config::SqlConfig>) -> Result<status::Custom<String>, status::Custom<String>> {
    relational::Database::initial_setup(data.into_inner()).await.map_err(|e| {
        status::Custom(
            Status::InternalServerError,
            format!("Database initialization failed: {}", e), // 连接失败信息
        )
    })?;
        
    Ok(status::Custom(
        Status::Ok,
        format!("Initialization successful"),
    ))
}

/**
 * 生成系统JWT接口
 *
 * # 返回
 * - `Result<status::Custom<String>, status::Custom<String>>`: JWT令牌或错误信息
 */
#[get("/system")]
async fn token_system() -> Result<status::Custom<String>, status::Custom<String>> {
    // 创建 Claims
    let claims = secret::CustomClaims {
        user_id: String::from("system"), // 用户ID
        device_ua: String::from("system"), // 设备用户代理
    };
    // 生成JWT
    let token = secret::generate_jwt(claims, Duration::seconds(1)).map_err(|e| {
        status::Custom(
            Status::InternalServerError,
            format!("JWT generation failed: {}", e), // JWT生成失败信息
        )
    })?;

    Ok(status::Custom(Status::Ok, token)) // 返回JWT令牌
}

/**
 * 启动Rocket应用
 *
 * # 返回
 * - `rocket::Rocket`: Rocket应用实例
 */
#[launch]
async fn rocket() -> _ {
    let config = config::Config::read().expect("Failed to read config"); // 读取配置

    if config.info.install {
        init_sql(config.sql_config)
        .await
        .expect("Failed to connect to database"); // 初始化数据库连接
        rocket::build()
        .mount("/auth/token", routes![token_system])   
    } else {
        rocket::build()
        .mount("/", routes![install]) // 挂载API路由
    }
}
