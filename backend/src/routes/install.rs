use crate::auth;
use crate::database::relational;
use crate::error::{AppResult, AppResultInto};
use super::{person, configure};
use crate::AppState;
use crate::{config, utils};
use chrono::Duration;
use rocket::{http::Status, post, response::status, serde::json::Json, State};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use serde_json::json;

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

    config.info.install = true;
    config.sql_config = data.sql_config.clone();

    let data = data.into_inner();

    relational::Database::initial_setup(data.sql_config.clone())
        .await
        .into_app_result()?;

    let _ = auth::jwt::generate_key();

    

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

    let mut system_configure = configure::SystemConfigure::default();
    system_configure.author_name = data.name.clone();

    configure::insert_configure(&sql, "system".to_string(), "configure".to_string(), Json(json!(system_configure))).await.into_app_result()?;
    

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
