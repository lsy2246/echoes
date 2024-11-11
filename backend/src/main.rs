// main.rs
mod config;
mod sql;
use crate::sql::Database;
use once_cell::sync::Lazy;
use rocket::{get, http::Status, launch, response::status, routes, serde::json::Json};
use std::sync::Arc;
use tokio::sync::Mutex;

/* 修改全局变量的类型定义 */
static DB: Lazy<Arc<Mutex<Option<Database>>>> = Lazy::new(|| Arc::new(Mutex::new(None)));

/* 数据库连接函数 */
async fn init_db(database: config::Database) -> Result<(), Box<dyn std::error::Error>> {
    let database = Database::init(database).await?;
    *DB.lock().await = Some(database);
    Ok(())
}
/* 获取数据库的引用 */
async fn get_db() -> Result<Database, Box<dyn std::error::Error>> {
    DB.lock()
        .await
        .clone()
        .ok_or_else(|| "Database not initialized".into())
}
/* 用于测试数据库 */
#[get("/sql")]
async fn ssql(
) -> Result<Json<Vec<std::collections::HashMap<String, String>>>, status::Custom<String>> {
    let db = get_db().await.map_err(|e| {
        status::Custom(
            Status::InternalServerError,
            format!("Database error: {}", e),
        )
    })?;

    let query_result = db
        .get_db()
        .query("SELECT * FROM info".to_string())
        .await
        .map_err(|e| status::Custom(Status::InternalServerError, format!("Query error: {}", e)))?;

    Ok(Json(query_result))
}
/* 安装接口 */
#[get("/install")]
async fn install() -> status::Custom<String> {
    get_db()
        .await
        .map(|_| status::Custom(Status::Ok, "Database connected successfully".into()))
        .unwrap_or_else(|e| {
            status::Custom(
                Status::InternalServerError,
                format!("Failed to connect: {}", e),
            )
        })
}
/* 启动函数 */
#[launch]
async fn rocket() -> _ {
    let config = config::Config::read("./src/config/config.toml").expect("Failed to read config");
    init_db(config.database)
        .await
        .expect("Failed to connect to database");
    rocket::build().mount("/api", routes![install, ssql])
}
