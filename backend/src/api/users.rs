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

pub async fn insert_user(sql: &sql::Database , data: RegisterData) -> CustomResult<()> {
    let role = match data.role.as_str() {
        "administrator" | "contributor" => data.role,
        _ => return Err("Invalid role. Must be either 'administrator' or 'contributor'".into_custom_error()),
    };

    let password_hash = bcrypt::generate_hash(&data.password)?;

    let mut builder =
        builder::QueryBuilder::new(builder::SqlOperation::Insert, sql.table_name("users"), sql.get_type())?;
    builder
        .set_value(
            "username".to_string(),
            builder::SafeValue::Text(data.username, builder::ValidationLevel::Standard),
        )?
        .set_value(
            "email".to_string(),
            builder::SafeValue::Text(data.email, builder::ValidationLevel::Standard),
        )?
        .set_value(
            "password_hash".to_string(),
            builder::SafeValue::Text(password_hash, builder::ValidationLevel::Relaxed),
        )?
        .set_value(
            "role".to_string(),
            builder::SafeValue::Text(role, builder::ValidationLevel::Strict),
        )?;

    sql.get_db().execute_query(&builder).await?;
    Ok(())
}

pub fn delete() {}

pub fn update() {}

pub fn select() {}

pub fn check() {}
