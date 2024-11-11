// /d:/data/echoes/backend/src/main.rs

/**
 * 主程序入口，提供数据库连接和相关API接口。
 * 
 * 接口：
 * - GET /api/install: 测试数据库连接
 * - GET /api/sql: 执行SQL查询并返回结果
 */

mod config; // 配置模块
mod sql; // SQL模块
use crate::sql::Database; // 引入数据库结构
use once_cell::sync::Lazy; // 用于延迟初始化
use rocket::{get, http::Status, launch, response::status, routes, serde::json::Json}; // 引入Rocket框架相关功能
use std::sync::Arc; // 引入Arc用于线程安全的引用计数
use tokio::sync::Mutex; // 引入Mutex用于异步锁

// 全局数据库连接变量
static DB: Lazy<Arc<Mutex<Option<Database>>>> = Lazy::new(|| Arc::new(Mutex::new(None)));

/**
 * 初始化数据库连接
 * 
 * # 参数
 * - `database`: 数据库配置
 * 
 * # 返回
 * - `Result<(), Box<dyn std::error::Error>>`: 初始化结果
 */
async fn init_db(database: config::Database) -> Result<(), Box<dyn std::error::Error>> {
    let database = Database::init(database).await?; // 初始化数据库
    *DB.lock().await = Some(database); // 保存数据库实例
    Ok(())
}

/**
 * 获取数据库的引用
 * 
 * # 返回
 * - `Result<Database, Box<dyn std::error::Error>>`: 数据库实例或错误
 */
async fn get_db() -> Result<Database, Box<dyn std::error::Error>> {
    DB.lock()
        .await
        .clone()
        .ok_or_else(|| "Database not initialized".into()) // 返回错误信息
}

/**
 * 测试数据库接口
 * 
 * # 返回
 * - `Result<Json<Vec<std::collections::HashMap<String, String>>>, status::Custom<String>>`: 查询结果或错误
 */
#[get("/sql")]
async fn ssql() -> Result<Json<Vec<std::collections::HashMap<String, String>>>, status::Custom<String>> {
    let db = get_db().await.map_err(|e| {
        status::Custom(
            Status::InternalServerError,
            format!("Database error: {}", e), // 数据库错误信息
        )
    })?;

    let query_result = db
        .get_db()
        .query("SELECT * FROM info".to_string())
        .await
        .map_err(|e| status::Custom(Status::InternalServerError, format!("Query error: {}", e)))?;

    Ok(Json(query_result)) // 返回查询结果
}

/**
 * 数据库安装接口
 * 
 * # 返回
 * - `status::Custom<String>`: 连接成功或失败的信息
 */
#[get("/install")]
async fn install() -> status::Custom<String> {
    get_db()
        .await
        .map(|_| status::Custom(Status::Ok, "Database connected successfully".into())) // 连接成功
        .unwrap_or_else(|e| {
            status::Custom(
                Status::InternalServerError,
                format!("Failed to connect: {}", e), // 连接失败信息
            )
        })
}

/**
 * 启动Rocket应用
 * 
 * # 返回
 * - `rocket::Rocket`: Rocket实例
 */
#[launch]
async fn rocket() -> _ {
    let config = config::Config::read("./src/config/config.toml").expect("Failed to read config"); // 读取配置
    init_db(config.database)
        .await
        .expect("Failed to connect to database"); // 初始化数据库连接
    rocket::build().mount("/api", routes![install, ssql]) // 挂载API路由
}
