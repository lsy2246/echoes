use super::fields::{FieldType, TargetType};
use super::users::Role;
use super::{fields, users};
use crate::common::config;
use crate::common::error::{AppResult, AppResultInto};
use crate::common::helpers;
use crate::security;
use crate::storage::sql;
use crate::AppState;
use chrono::Duration;
use rocket::{http::Status, post, response::status, serde::json::Json, State};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::Arc;

#[post("/sql", format = "application/json", data = "<sql_config>")]
pub async fn setup_sql(
    sql_config: Json<config::SqlConfig>,
    state: &State<Arc<AppState>>,
) -> AppResult<String> {
    let mut config = config::Config::read().unwrap_or_default();
    if config.init.sql {
        return Err(status::Custom(
            Status::BadRequest,
            "数据库已经初始化".to_string(),
        ));
    }

    let sql_config = sql_config.into_inner();

    config.init.sql = true;
    config.sql_config = sql_config.clone();
    sql::Database::initial_setup(sql_config.clone())
        .await
        .into_app_result()?;

    config::Config::write(config).into_app_result()?;
    state.trigger_restart().await.into_app_result()?;
    Ok("Database installation successful".to_string())
}

#[derive(Deserialize, Serialize, Debug)]
pub struct StepAccountData {
    username: String,
    email: String,
    password: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct StepAccountResponse {
    token: String,
    username: String,
    password: String,
}

#[post("/administrator", format = "application/json", data = "<data>")]
pub async fn setup_account(
    data: Json<StepAccountData>,
    state: &State<Arc<AppState>>,
) -> AppResult<Json<StepAccountResponse>> {
    let mut config = config::Config::read().unwrap_or_default();
    if config.init.administrator {
        return Err(status::Custom(
            Status::BadRequest,
            "管理员用户已设置".to_string(),
        ));
    }

    security::jwt::generate_key().into_app_result()?;

    let data = data.into_inner();

    let sql = {
        state.sql_link(&config.sql_config).await.into_app_result()?;
        state.sql_get().await.into_app_result()?
    };


    users::insert_user(
        &sql,
        users::RegisterData {
            username: data.username.clone(),
            email: data.email,
            password: data.password,
            role: Role::Administrator,
        },
    )
    .await
    .into_app_result()?;

    let system_credentials = (
        helpers::generate_random_string(20),
        helpers::generate_random_string(20),
    );

    let system_account = users::RegisterData {
        username: system_credentials.0.clone(),
        email: "author@lsy22.com".to_string(),
        password: system_credentials.1.clone(),
        role: Role::Administrator,
    };

    users::insert_user(
        &sql,
        system_account, 
    )
    .await
    .into_app_result()?;

    fields::insert_fields(
        &sql,
        TargetType::System,
        0,
        FieldType::Meta,
        "keywords".to_string(),
        "echoes,blog,个人博客".to_string(),
    )
    .await
    .into_app_result()?;

    fields::insert_fields(
        &sql,
        TargetType::System,
        0,
        FieldType::Data,
        "current_theme".to_string(),
        "echoes".to_string(),
    )
    .await
    .into_app_result()?;

    let token = security::jwt::generate_jwt(
        security::jwt::CustomClaims {
            name: data.username,
            role: Role::Administrator.to_string(),
        },
        Duration::days(7),
    )
    .into_app_result()?;
    config.init.administrator = true;
    config::Config::write(config).into_app_result()?;
    state.trigger_restart().await.into_app_result()?;

    Ok(Json(StepAccountResponse {
        token,
        username: system_credentials.0,
        password: system_credentials.1,
    }))
}