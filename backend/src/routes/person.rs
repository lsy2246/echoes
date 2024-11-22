use crate::database::{relational, relational::builder};
use crate::utils::CustomResult;
use crate::{config, utils};
use bcrypt::{hash, DEFAULT_COST};
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
}

pub async fn insert(sql: &relational::Database, data: RegisterData) -> CustomResult<()> {
    let hashed_password = hash(data.password, DEFAULT_COST).expect("Failed to hash password");

    let mut user_params = HashMap::new();
    user_params.insert(
        builder::ValidatedValue::Identifier(String::from("person_name")),
        builder::ValidatedValue::PlainText(data.name),
    );
    user_params.insert(
        builder::ValidatedValue::Identifier(String::from("person_email")),
        builder::ValidatedValue::PlainText(data.email),
    );
    user_params.insert(
        builder::ValidatedValue::Identifier(String::from("person_password")),
        builder::ValidatedValue::PlainText(hashed_password),
    );

    let builder =
        builder::QueryBuilder::new(builder::SqlOperation::Insert, String::from("persons"))?
            .params(user_params);

    sql.get_db().execute_query(&builder).await?;
    Ok(())
}

pub fn delete() {}

pub fn update() {}

pub fn select() {}

pub fn check() {}
