use crate::auth;
use crate::database::relational;
use crate::error::{AppResult, AppResultInto};
use crate::routes::person;
use crate::AppState;
use crate::{config, utils};
use chrono::Duration;
use rocket::{http::Status, post, response::status, serde::json::Json, State};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

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
    state: &State<Arc<AppState>>,
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
        .into_app_result()?;

    let _ = auth::jwt::generate_key();

    config.info.install = true;

    state.sql_link(&data.sql_config).await.into_app_result()?;
    let sql = state.sql_get().await.into_app_result()?;

    let system_name = utils::generate_random_string(20);
    let system_password = utils::generate_random_string(20);

    let _ = person::insert(
        &sql,
        person::RegisterData {
            name: data.name.clone(),
            email: data.email,
            password: data.password,
            level: "administrators".to_string(),
        },
    )
    .await
    .into_app_result()?;

    let _ = person::insert(
        &sql,
        person::RegisterData {
            name: system_name.clone(),
            email: String::from("author@lsy22.com"),
            password: system_password.clone(),
            level: "administrators".to_string(),
        },
    )
    .await
    .into_app_result()?;

    let token = auth::jwt::generate_jwt(
        auth::jwt::CustomClaims {
            name: data.name.clone(),
        },
        Duration::days(7),
    )
    .into_app_result()?;

    config::Config::write(config.clone()).into_app_result()?;

    state.trigger_restart().await.into_app_result()?;
    Ok(status::Custom(
        Status::Ok,
        Json(InstallReplyData {
            token: token,
            name: system_name,
            password: system_password,
        }),
    ))
}
