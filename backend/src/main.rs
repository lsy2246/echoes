mod config;
mod database;
mod auth;
mod utils;
mod routes;
use chrono::Duration;
use database::relational;
use rocket::{
    get, post,
    http::Status,
    launch,
    response::status,
    State,
};
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Debug)]
pub enum AppError {
    Database(String),
    Config(String),
    Auth(String),
}

impl From<AppError> for status::Custom<String> {
    fn from(error: AppError) -> Self {
        match error {
            AppError::Database(msg) => status::Custom(Status::InternalServerError, format!("Database error: {}", msg)),
            AppError::Config(msg) => status::Custom(Status::InternalServerError, format!("Config error: {}", msg)),
            AppError::Auth(msg) => status::Custom(Status::InternalServerError, format!("Auth error: {}", msg)),
        }
    }
}

type AppResult<T> = Result<T, AppError>;

struct AppState {
    db: Arc<Mutex<Option<relational::Database>>>,
    configure: Arc<Mutex<config::Config>>,
}

impl AppState {
    async fn get_sql(&self) -> AppResult<relational::Database> {
        self.db
            .lock()
            .await
            .clone()
            .ok_or_else(|| AppError::Database("Database not initialized".into()))
    }

    async fn link_sql(&self, config: config::SqlConfig) -> AppResult<()> {
        let database = relational::Database::link(&config)
            .await
            .map_err(|e| AppError::Database(e.to_string()))?;
        *self.db.lock().await = Some(database);
        Ok(())
    }

}



#[get("/system")]
async fn token_system(_state: &State<AppState>) -> Result<status::Custom<String>, status::Custom<String>> {
    let claims = auth::jwt::CustomClaims {
        name: "system".into(),
    };

    auth::jwt::generate_jwt(claims, Duration::seconds(1))
        .map(|token| status::Custom(Status::Ok, token))
        .map_err(|e| AppError::Auth(e.to_string()).into())
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
            state.link_sql(config.sql_config.clone())
                .await
                .expect("Failed to connect to database");
        }
    }

    if ! config.info.install {
        rocket_builder = rocket_builder
            .mount("/", rocket::routes![routes::intsall::install]);
    } 
   
    rocket_builder = rocket_builder
            .mount("/auth/token", rocket::routes![token_system])
            .mount("/", rocket::routes![routes::intsall::test]);

    rocket_builder
}

#[tokio::test]
async fn test_placeholder() {
    let config = config::Config::read().expect("Failed to read config");
    
    let state = AppState {
        db: Arc::new(Mutex::new(None)),
        configure: Arc::new(Mutex::new(config.clone())),
    };
    state.link_sql(config.sql_config.clone())
        .await
        .expect("Failed to connect to database");
    let sql=state.get_sql().await.expect("Failed to get sql");
    let _=routes::person::insert(&sql,routes::person::RegisterData{ name: String::from("test"), email: String::from("lsy22@vip.qq.com"), password:String::from("test") }).await.unwrap();
}

