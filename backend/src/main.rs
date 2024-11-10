// main.rs
mod sql;
mod config;
use rocket::{ get, launch, routes};
use rocket::serde::json::Json; // Added import for Json
use once_cell::sync::Lazy;
use rocket::http::Status;
use rocket::response::status;
use std::sync::Arc; // Added import for Arc and Mutex
use tokio::sync::Mutex;
use crate::sql::Database;

// 修改全局变量的类型定义
static GLOBAL_SQL: Lazy<Arc<Mutex<Option<Database>>>> = Lazy::new(|| {
    Arc::new(Mutex::new(None))
});

// 修改数据库连接函数
async fn connect_database() -> Result<(), Box<dyn std::error::Error>> {
    let database = sql::Database::init().await?;
    let mut lock = GLOBAL_SQL.lock().await;
    *lock = Some(database);
    Ok(())
}

async fn get_db() -> Result<Database, Box<dyn std::error::Error>> {
    let lock = GLOBAL_SQL.lock().await;
    match &*lock {
        Some(db) => Ok(db.clone()),
        None => Err("Database not initialized".into())
    }
}


#[get("/sql")]
async fn ssql() -> Result<Json<Vec<std::collections::HashMap<String, String>>>, status::Custom<String>> {
    let db = get_db().await.map_err(|e| {
        eprintln!("Database error: {}", e);
        status::Custom(Status::InternalServerError, format!("Database error: {}", e))
    })?;

    let query_result = db.get_db()
        .query("SELECT * FROM info".to_string())  // 确保这里是正确的表名
        .await
        .map_err(|e| {
            eprintln!("Query error: {}", e);
            status::Custom(Status::InternalServerError, format!("Query error: {}", e))
        })?;

    Ok(Json(query_result))
}


#[get("/install")]
async fn install() -> status::Custom<String> {
    match connect_database().await {
        Ok(_) => status::Custom(Status::Ok, "Database connected successfully".to_string()),
        Err(e) => status::Custom(Status::InternalServerError, format!("Failed to connect: {}", e))
    }
}


#[launch]
async fn rocket() -> _ {
    connect_database().await.expect("Failed to connect to database");
    rocket::build()
        .mount("/api", routes![install,ssql])
}