mod config;
mod database;
mod auth;
mod utils;
mod routes;
use chrono::Duration;
use database::relational;
use rocket::{
    get, http::Status, launch,  response::status, State
};
use std::sync::Arc;
use tokio::sync::Mutex;
use utils::{CustomResult, AppResult,CustomError};



struct AppState {
    db: Arc<Mutex<Option<relational::Database>>>,
    configure: Arc<Mutex<config::Config>>,
}

impl AppState {
        async fn get_sql(&self) -> CustomResult<relational::Database> {
        self.db
            .lock()
            .await
            .clone()
            .ok_or_else(|| CustomError::from_str("Database not initialized"))
    }

    async fn link_sql(&self, config: config::SqlConfig) ->  Result<(),CustomError>  {
        let database = relational::Database::link(&config)
            .await?;
        *self.db.lock().await = Some(database);
        Ok(())
    }

}



#[get("/system")]
async fn token_system(_state: &State<AppState>) -> AppResult<status::Custom<String>> {
    let claims = auth::jwt::CustomClaims {
        name: "system".into(),
    };

    auth::jwt::generate_jwt(claims, Duration::seconds(1))
        .map(|token| status::Custom(Status::Ok, token))
        .map_err(|e| status::Custom(Status::InternalServerError, e.to_string()))
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
            .mount("/auth/token", rocket::routes![token_system]);

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

