use super::{settings, users};
use crate::security;
use crate::storage::sql;
use crate::common::error::{AppResult, AppResultInto};
use crate::AppState;
use crate::common::config;
use crate::common::helpers;
use chrono::Duration;
use rocket::{http::Status, post, response::status, serde::json::Json, State};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::Arc;

#[derive(Deserialize, Serialize,Debug)]
pub struct InstallData {
    username: String,
    email: String,
    password: String,
    sql_config: config::SqlConfig,
}
#[derive(Deserialize, Serialize,Debug)]
pub struct InstallReplyData {
    token: String,
    username: String,
    password: String,
}

#[post("/install", format = "application/json", data = "<data>")]
pub async fn install(
    data: Json<InstallData>,
    state: &State<Arc<AppState>>,
) -> AppResult<status::Custom<Json<InstallReplyData>>> {
    let mut config = config::Config::read().unwrap_or_default();
    if config.info.install {
        return Err(status::Custom(
            Status::BadRequest,
            "Database already initialized".to_string(),
        ));
    }
    let data = data.into_inner();
    let sql = {
        config.info.install = true;
        config.sql_config = data.sql_config.clone();
        sql::Database::initial_setup(data.sql_config.clone())
            .await
            .into_app_result()?;
        security::jwt::generate_key().into_app_result()?;
        state.sql_link(&data.sql_config).await.into_app_result()?;
        state.sql_get().await.into_app_result()?
    };


    let system_credentials = (
        helpers::generate_random_string(20),
        helpers::generate_random_string(20),
    );

    users::insert_user(
        &sql,
        users::RegisterData {
            username: data.username.clone(),
            email: data.email,
            password: data.password,
            role: "administrator".to_string(),
        },
    )
    .await
    .into_app_result()?;

    users::insert_user(
        &sql,
        users::RegisterData {
            username: system_credentials.0.clone(),
            email: "author@lsy22.com".to_string(),
            password: system_credentials.1.clone(),
            role: "administrator".to_string(),
        },
    )
    .await
    .into_app_result()?;


    settings::insert_setting(
        &sql,
        "system".to_string(),
        "settings".to_string(),
        Json(json!(settings::SystemConfigure {
            author_name: data.username.clone(),
            ..settings::SystemConfigure::default()
        })),
    )
    .await
    .into_app_result()?;

    let token = security::jwt::generate_jwt(
        security::jwt::CustomClaims { name: data.username },
        Duration::days(7),
    )
    .into_app_result()?;

    config::Config::write(config).into_app_result()?;
    state.trigger_restart().await.into_app_result()?;

    Ok(status::Custom(
        Status::Ok,
        Json(InstallReplyData {
            token,
            username: system_credentials.0,
            password: system_credentials.1,
        }),
    ))
}
