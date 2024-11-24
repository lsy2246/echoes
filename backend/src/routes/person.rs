use crate::auth;
use crate::auth::bcrypt;
use crate::database::{relational, relational::builder};
use crate::error::{CustomErrorInto, CustomResult};
use crate::{config, utils};
use rocket::{get, http::Status, post, response::status, serde::json::Json, State};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Deserialize, Serialize)]
pub struct LoginData {
    pub name: String,
    pub password: String,
}

pub struct RegisterData {
    pub name: String,
    pub email: String,
    pub password: String,
    pub level: String,
}

pub async fn insert(sql: &relational::Database, data: RegisterData) -> CustomResult<()> {
    let mut builder =
        builder::QueryBuilder::new(builder::SqlOperation::Insert, "persons".to_string())?;

    let password_hash = auth::bcrypt::generate_hash(&data.password)?;

    builder
        .set_value(
            "person_name".to_string(),
            builder::SafeValue::Text(data.name.to_string(), builder::ValidationLevel::Relaxed),
        )?
        .set_value(
            "person_email".to_string(),
            builder::SafeValue::Text(data.email.to_string(), builder::ValidationLevel::Relaxed),
        )?
        .set_value(
            "person_password".to_string(),
            builder::SafeValue::Text(password_hash, builder::ValidationLevel::Relaxed),
        )?
        .set_value(
            "person_level".to_string(),
            builder::SafeValue::Enum(
                data.level.to_string(),
                "privilege_level".to_string(),
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
