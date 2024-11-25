use crate::auth;
use crate::database::relational::builder;
use crate::error::{AppResult, AppResultInto};
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
    name: String,
    password: String,
}
#[post("/system", format = "application/json", data = "<data>")]
pub async fn token_system(
    state: &State<Arc<AppState>>,
    data: Json<TokenSystemData>,
) -> AppResult<String> {
    let name_condition = builder::Condition::new(
        "person_name".to_string(),
        builder::Operator::Eq,
        Some(builder::SafeValue::Text(
            data.name.to_string(),
            builder::ValidationLevel::Relaxed,
        )),
    )
    .into_app_result()?;

    let email_condition = builder::Condition::new(
        "person_email".to_string(),
        builder::Operator::Eq,
        Some(builder::SafeValue::Text(
            "author@lsy22.com".to_string(),
            builder::ValidationLevel::Relaxed,
        )),
    )
    .into_app_result()?;

    let level_condition = builder::Condition::new(
        "person_level".to_string(),
        builder::Operator::Eq,
        Some(builder::SafeValue::Enum(
            "administrators".to_string(),
            "privilege_level".to_string(),
            builder::ValidationLevel::Standard,
        )),
    )
    .into_app_result()?;

    let where_clause = builder::WhereClause::And(vec![
        builder::WhereClause::Condition(name_condition),
        builder::WhereClause::Condition(email_condition),
        builder::WhereClause::Condition(level_condition),
    ]);

    let mut builder =
        builder::QueryBuilder::new(builder::SqlOperation::Select, String::from("persons"))
            .into_app_result()?;

    let builder = builder
        .add_field("person_password".to_string())
        .into_app_result()?;

    let sql_builder = builder.add_condition(where_clause);
    let values = state
        .sql_get()
        .await
        .into_app_result()?
        .get_db()
        .execute_query(&sql_builder)
        .await
        .into_app_result()?;

    let password = values
        .first()
        .ok_or(status::Custom(
            Status::NotFound,
            String::from("该用户并非系统用户"),
        ))?
        .get("person_password")
        .ok_or(status::Custom(
            Status::NotFound,
            String::from("该用户密码丢失"),
        ))?;

    auth::bcrypt::verify_hash(&data.password, password).map_err(|_| {
        status::Custom(Status::Forbidden, String::from("密码错误"))
    })?;

    let claims = auth::jwt::CustomClaims {
        name: "system".into(),
    };
    let token = auth::jwt::generate_jwt(claims, Duration::minutes(1)).into_app_result()?;

    Ok(token)
}
