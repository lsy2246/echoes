mod config;
mod database;
mod secret;

use chrono::Duration;
use database::relational;
use once_cell::sync::Lazy;
use rocket::{get, post, http::Status, launch, response::status, routes, serde::json::Json};
use std::sync::Arc;
use tokio::sync::Mutex;

static SQL: Lazy<Arc<Mutex<Option<relational::Database>>>> =
    Lazy::new(|| Arc::new(Mutex::new(None)));

async fn init_sql(database: config::SqlConfig) -> Result<(), Box<dyn std::error::Error>> {
    let database = relational::Database::link(database).await?;
    *SQL.lock().await = Some(database);
    Ok(())
}

async fn get_sql() -> Result<relational::Database, Box<dyn std::error::Error>> {
    SQL.lock()
        .await
        .clone()
        .ok_or_else(|| "Database not initialized".into())
}

#[post("/install", format = "json", data = "<data>")]
async fn install(data: Json<config::SqlConfig>) -> Result<status::Custom<String>, status::Custom<String>> {
    relational::Database::initial_setup(data.into_inner()).await.map_err(|e| {
        status::Custom(
            Status::InternalServerError,
            format!("Database initialization failed: {}", e),
        )
    })?;
        
    Ok(status::Custom(
        Status::Ok,
        format!("Initialization successful"),
    ))
}

#[get("/system")]
async fn token_system() -> Result<status::Custom<String>, status::Custom<String>> {
    let claims = secret::CustomClaims {
        user_id: String::from("system"),
        device_ua: String::from("system"),
    };
    let token = secret::generate_jwt(claims, Duration::seconds(1)).map_err(|e| {
        status::Custom(
            Status::InternalServerError,
            format!("JWT generation failed: {}", e),
        )
    })?;

    Ok(status::Custom(Status::Ok, token))
}

#[launch]
async fn rocket() -> _ {
    let config = config::Config::read().expect("Failed to read config");

    if config.info.install {
        init_sql(config.sql_config)
        .await
        .expect("Failed to connect to database");
        rocket::build()
        .mount("/auth/token", routes![token_system])   
    } else {
        rocket::build()
        .mount("/", routes![install])
    }
}
