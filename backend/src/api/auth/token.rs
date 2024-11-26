use crate::security;
use crate::storage::sql::builder;
use crate::common::error::{AppResult, AppResultInto};
use crate::AppState;
use chrono::Duration;
use rocket::{
    http::Status,
    post,
    response::status,
    serde::json::{Json, Value},
    State,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::Arc;
#[derive(Deserialize, Serialize)]
pub struct TokenSystemData {
    username: String,
    password: String,
}
#[post("/system", format = "application/json", data = "<data>")]
pub async fn token_system(
    state: &State<Arc<AppState>>,
    data: Json<TokenSystemData>,
) -> AppResult<String> {
    let mut builder =
        builder::QueryBuilder::new(builder::SqlOperation::Select, "users".to_string())
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
                    "email".to_string(),
                    builder::Operator::Eq,
                    Some(builder::SafeValue::Text(
                        "author@lsy22.com".into(),
                        builder::ValidationLevel::Relaxed,
                    )),
                )
                .into_app_result()?,
            ),
            builder::WhereClause::Condition(
                builder::Condition::new(
                    "role".to_string(),
                    builder::Operator::Eq,
                    Some(builder::SafeValue::Enum(
                        "administrator".into(),
                        "user_role".into(),
                        builder::ValidationLevel::Standard,
                    )),
                )
                .into_app_result()?,
            ),
        ]));

    let values = state
        .sql_get()
        .await
        .into_app_result()?
        .get_db()
        .execute_query(&builder)
        .await
        .into_app_result()?;

    let password = values
        .first()
        .and_then(|row| row.get("password_hash"))
        .and_then(|val| val.as_str())
        .ok_or_else(|| {
            status::Custom(Status::NotFound, "Invalid system user or password".into())
        })?;

    security::bcrypt::verify_hash(&data.password, password)
        .map_err(|_| status::Custom(Status::Forbidden, "Invalid password".into()))?;

    Ok(security::jwt::generate_jwt(
        security::jwt::CustomClaims {
            name: "system".into(),
        },
        Duration::minutes(1),
    )
    .into_app_result()?)
}
