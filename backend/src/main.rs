// main.rs

/**
 * 主程序入口，提供数据库连接和相关API接口。
 * 
 * 接口：
 * - GET /api/install: 测试数据库连接
 * - GET /api/sql: 执行SQL查询并返回结果
 */

mod config; // 配置模块
mod database;
mod secret;
use chrono::Duration;
// 数据库模块
use database::relational; // 引入关系型数据库
use once_cell::sync::Lazy; // 用于延迟初始化
use rocket::{get, http::Status, launch, response::status, routes, serde::json::Json}; // 引入Rocket框架相关功能
use std::sync::Arc;
// 引入Arc用于线程安全的引用计数
use tokio::sync::Mutex; // 引入Mutex用于异步锁

// 全局数据库连接变量
static DB: Lazy<Arc<Mutex<Option<relational::Database>>>> = Lazy::new(|| Arc::new(Mutex::new(None)));

/**
 * 初始化数据库连接
 */
async fn init_db(database: config::DbConfig) -> Result<(), Box<dyn std::error::Error>> {
    let database = relational::Database::init(database).await?; // 初始化数据库
    *DB.lock().await = Some(database); // 保存数据库实例
    Ok(())
}

/**
 * 获取数据库的引用
 */
async fn get_db() -> Result<relational::Database, Box<dyn std::error::Error>> {
    DB.lock()
        .await
        .clone()
        .ok_or_else(|| "Database not initialized".into()) // 返回错误信息
}

/**
 * 测试数据库接口
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

#[get("/system")]
async fn token_system() -> Result<status::Custom<String>, status::Custom<String>> {
    // 创建 Claims
    let claims = secret::CustomClaims {
        user_id: String::from("system"),
        device_ua: String::from("system"),
    };
    // 生成JWT
    let token = secret::generate_jwt(claims,Duration::seconds(1))
        .map_err(|e| status::Custom(Status::InternalServerError, format!("JWT generation failed: {}", e)))?;
    
    Ok(status::Custom(Status::Ok, token))
}

/**
 * 启动Rocket应用
 */
#[launch]
async fn rocket() -> _ {
    let config = config::Config::read().expect("Failed to read config"); // 读取配置
    init_db(config.db_config)
        .await
        .expect("Failed to connect to database"); // 初始化数据库连接
    rocket::build()
        .mount("/", routes![install, ssql]) // 挂载API路由
        .mount("/auth/token", routes![token_system])
}
