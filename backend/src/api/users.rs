use crate::security;
use crate::security::bcrypt;
use crate::storage::{sql, sql::builder};
use crate::common::error::{CustomErrorInto, CustomResult};
use rocket::{get, http::Status, post, response::status, serde::json::Json, State};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Deserialize, Serialize)]
pub struct LoginData {
    pub username: String,
    pub password: String,
}

#[derive(Debug)]
pub struct RegisterData {
    pub username: String,
    pub email: String,
    pub password: String,
    pub role: String,
}

pub async fn insert_user(sql: &sql::Database, data: RegisterData) -> CustomResult<()> {
    let role = match data.role.as_str() {
        "administrator" | "contributor" => data.role,
        _ => return Err("Invalid role. Must be either 'administrator' or 'contributor'".into_custom_error()),
    };

    let mut builder =
        builder::QueryBuilder::new(builder::SqlOperation::Insert, "users".to_string())?;
    builder
        .set_value(
            "username".to_string(),
            builder::SafeValue::Text(data.username, builder::ValidationLevel::Relaxed),
        )?
        .set_value(
            "email".to_string(),
            builder::SafeValue::Text(data.email, builder::ValidationLevel::Relaxed),
        )?
        .set_value(
            "password_hash".to_string(),
            builder::SafeValue::Text(
                bcrypt::generate_hash(&data.password)?,
                builder::ValidationLevel::Relaxed,
            ),
        )?
        .set_value(
            "role".to_string(),
            builder::SafeValue::Enum(
                role,
                "user_role".to_string(),
                builder::ValidationLevel::Standard,
            ),
        )?;

    sql.get_db().execute_query(&builder).await?;
    Ok(())
}

pub fn delete() {}

pub fn update() {}

pub fn select() {}

pub fn check() {}
