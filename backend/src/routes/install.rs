use super::{configure, person};
use crate::auth;
use crate::database::relational;
use crate::error::{AppResult, AppResultInto};
use crate::AppState;
use crate::{config, utils};
use chrono::Duration;
use rocket::{http::Status, post, response::status, serde::json::Json, State};
use serde::{Deserialize, Serialize};
use serde_json::json;
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

        relational::Database::initial_setup(data.sql_config.clone())
            .await
            .into_app_result()?;
        auth::jwt::generate_key().into_app_result()?;

        state.sql_link(&data.sql_config).await.into_app_result()?;
        state.sql_get().await.into_app_result()?
    };

    let system_credentials = (
        utils::generate_random_string(20),
        utils::generate_random_string(20),
    );

    person::insert(
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

    person::insert(
        &sql,
        person::RegisterData {
            name: system_credentials.0.clone(),
            email: "author@lsy22.com".to_string(),
            password: system_credentials.1.clone(),
            level: "administrators".to_string(),
        },
    )
    .await
    .into_app_result()?;

    configure::insert_configure(
        &sql,
        "system".to_string(),
        "config".to_string(),
        Json(json!(configure::SystemConfigure {
            author_name: data.name.clone(),
            ..configure::SystemConfigure::default()
        })),
    )
    .await
    .into_app_result()?;

    let token = auth::jwt::generate_jwt(
        auth::jwt::CustomClaims { name: data.name },
        Duration::days(7),
    )
    .into_app_result()?;

    config::Config::write(config).into_app_result()?;
    state.trigger_restart().await.into_app_result()?;

    Ok(status::Custom(
        Status::Ok,
        Json(InstallReplyData {
            token,
            name: system_credentials.0,
            password: system_credentials.1,
        }),
    ))
}
