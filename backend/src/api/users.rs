use crate::common::error::{CustomErrorInto, CustomResult};
use crate::security::bcrypt;
use crate::storage::{sql, sql::builder};
use regex::Regex;
use rocket::{get, http::Status, post, response::status, serde::json::Json, State};
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Formatter};

#[derive(Deserialize, Serialize)]
pub struct LoginData {
    pub username: String,
    pub password: String,
}

#[derive(Debug)]
pub enum Role {
    Administrator,
    Visitor,
}

impl Display for Role {
    fn fmt(&self, f: &mut Formatter) -> std::fmt::Result {
        match self {
            Role::Administrator => write!(f, "administrator"),
            Role::Visitor => write!(f, "visitor"),
        }
    }
}

#[derive(Debug)]
pub struct RegisterData {
    pub username: String,
    pub email: String,
    pub password: String,
    pub role: Role,
}

pub async fn insert_user(sql: &sql::Database, data: RegisterData) -> CustomResult<()> {
    let password_hash = bcrypt::generate_hash(&data.password)?;

    let re = Regex::new(r"([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)")?;

    if false == re.is_match(&data.email) {
        return Err("邮箱格式不正确".into_custom_error());
    }

    let mut builder = builder::QueryBuilder::new(
        builder::SqlOperation::Insert,
        sql.table_name("users"),
        sql.get_type(),
    )?;
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
            builder::SafeValue::Text(data.role.to_string(), builder::ValidationLevel::Strict),
        )?;

    sql.get_db().execute_query(&builder).await?;
    Ok(())
}

pub fn delete() {}

pub fn update() {}

pub fn select() {}

pub fn check() {}
