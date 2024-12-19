use crate::common::error::{AppResult, AppResultInto};
use crate::security;
use crate::storage::sql::builder;
use crate::AppState;
use chrono::Duration;
use rocket::{http::Status, post,get, response::status, serde::json::Json, State};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::api::Role;

#[derive(Deserialize, Serialize)]
pub struct TokenData {
    username: String,
    password: String,
}
#[post("/system", format = "application/json", data = "<data>")]
pub async fn token_system(
    state: &State<Arc<AppState>>,
    data: Json<TokenData>,
) -> AppResult<String> {
    let sql = state.sql_get().await.into_app_result()?;
    let mut builder = builder::QueryBuilder::new(
        builder::SqlOperation::Select,
        sql.table_name("users"),
        sql.get_type(),
    )
    .into_app_result()?;
    builder
        .add_field("password_hash".to_string())
        .into_app_result()?
        .add_condition(builder::WhereClause::And(vec![
            builder::WhereClause::Condition(
                builder::Condition::new(
                    "username".to_string(),
                    builder::Operator::Eq,
                    Some(builder::SafeValue::Text(
                        data.username.clone(),
                        builder::ValidationLevel::Relaxed,
                    )),
                )
                .into_app_result()?,
            ),
            builder::WhereClause::Condition(
                builder::Condition::new(
                    "role".to_string(),
                    builder::Operator::Eq,
                    Some(builder::SafeValue::Text(
                        "administrator".into(),
                        builder::ValidationLevel::Standard,
                    )),
                )
                .into_app_result()?,
            ),
        ]));

    let values = sql
        .get_db()
        .execute_query(&builder)
        .await
        .into_app_result()?;


    let password = values
        .first()
        .and_then(|row| row.get("password_hash"))
        .and_then(|val| val.as_str())
        .ok_or_else(|| status::Custom(Status::NotFound, "系统用户或密码无效".into()))?;

    security::bcrypt::verify_hash(&data.password, password)
        .map_err(|_| status::Custom(Status::Forbidden, "密码无效".into()))?;

    Ok(security::jwt::generate_jwt(
        security::jwt::CustomClaims {
            name: "system".into(),
            role: Role::Administrator.to_string(),
        },
        Duration::minutes(1),
    )
    .into_app_result()?)
}


#[get("/test")]
pub async fn test_token(state: &State<Arc<AppState>>) -> AppResult<String> {
    Ok(security::jwt::generate_jwt(
        security::jwt::CustomClaims {
            name: "system".into(),
            role: Role::Administrator.to_string(),
        },
        Duration::days(999),
    )
    .into_app_result()?)
}
