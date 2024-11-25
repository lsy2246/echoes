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
    let mut builder =
        builder::QueryBuilder::new(builder::SqlOperation::Select, "persons".to_string())
            .into_app_result()?;
    builder
        .add_field("person_password".to_string())
        .into_app_result()?
        .add_condition(builder::WhereClause::And(vec![
            builder::WhereClause::Condition(
                builder::Condition::new(
                    "person_name".to_string(),
                    builder::Operator::Eq,
                    Some(builder::SafeValue::Text(
                        data.name.clone(),
                        builder::ValidationLevel::Relaxed,
                    )),
                )
                .into_app_result()?,
            ),
            builder::WhereClause::Condition(
                builder::Condition::new(
                    "person_email".to_string(),
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
                    "person_level".to_string(),
                    builder::Operator::Eq,
                    Some(builder::SafeValue::Enum(
                        "administrators".into(),
                        "privilege_level".into(),
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
        .and_then(|row| row.get("person_password"))
        .and_then(|val| val.as_str())
        .ok_or_else(|| {
            status::Custom(Status::NotFound, "Invalid system user or password".into())
        })?;

    auth::bcrypt::verify_hash(&data.password, password)
        .map_err(|_| status::Custom(Status::Forbidden, "Invalid password".into()))?;

    Ok(auth::jwt::generate_jwt(
        auth::jwt::CustomClaims {
            name: "system".into(),
        },
        Duration::minutes(1),
    )
    .into_app_result()?)
}
