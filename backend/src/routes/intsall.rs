use crate::auth;
use crate::database::relational;
use crate::routes::person;
use crate::utils::AppResult;
use crate::AppState;
use crate::{config, utils};
use chrono::Duration;
use rocket::{http::Status, post, response::status, serde::json::Json, State};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct InstallData {
    name: String,
    email: String,
    password: String,
    sql_config: config::SqlConfig,
}
#[derive(Deserialize, Serialize)]
pub struct InstallReplyData {
    token: String,
    name: String,
    password: String,
}

#[post("/install", format = "application/json", data = "<data>")]
pub async fn install(
    data: Json<InstallData>,
    state: &State<AppState>,
) -> AppResult<status::Custom<Json<InstallReplyData>>> {
    let mut config = state.configure.lock().await;
    if config.info.install {
        return Err(status::Custom(
            Status::BadRequest,
            "Database already initialized".to_string(),
        ));
    }

    let data = data.into_inner();

    relational::Database::initial_setup(data.sql_config.clone())
        .await
        .map_err(|e| status::Custom(Status::InternalServerError, e.to_string()))?;

    let _ = auth::jwt::generate_key();

    config.info.install = true;

    state
        .link_sql(data.sql_config.clone())
        .await
        .map_err(|e| status::Custom(Status::InternalServerError, e.to_string()))?;
    let sql = state
        .get_sql()
        .await
        .map_err(|e| status::Custom(Status::InternalServerError, e.to_string()))?;

    let system_name = utils::generate_random_string(20);
    let system_password = utils::generate_random_string(20);

    let _ = person::insert(
        &sql,
        person::RegisterData {
            name: data.name.clone(),
            email: data.email,
            password: data.password,
        },
    )
    .await
    .map_err(|e| status::Custom(Status::InternalServerError, e.to_string()));
    let _ = person::insert(
        &sql,
        person::RegisterData {
            name: system_name.clone(),
            email: String::from("author@lsy22.com"),
            password: system_name.clone(),
        },
    )
    .await
    .map_err(|e| status::Custom(Status::InternalServerError, e.to_string()));
    let token = auth::jwt::generate_jwt(
        auth::jwt::CustomClaims {
            name: data.name.clone(),
        },
        Duration::days(7),
    )
    .map_err(|e| status::Custom(Status::Unauthorized, e.to_string()))?;

    config::Config::write(config.clone())
        .map_err(|e| status::Custom(Status::InternalServerError, e.to_string()))?;
    Ok(status::Custom(
        Status::Ok,
        Json(InstallReplyData {
            token: token,
            name: system_name,
            password: system_password,
        }),
    ))
}
