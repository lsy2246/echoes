use super::SystemToken;
use crate::common::error::{AppResult, AppResultInto, CustomResult};
use crate::storage::{sql, sql::builder};
use crate::AppState;
use rocket::{
    get,
    http::Status,
    serde::json::{Json, Value},
    State,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::Arc;

#[derive(Deserialize, Serialize)]
pub struct SystemConfigure {
    pub author_name: String,
    pub current_theme: String,
    pub site_keyword: String,
    pub site_description: String,
    pub admin_path: String,
}

impl Default for SystemConfigure {
    fn default() -> Self {
        Self {
            author_name: "lsy".to_string(),
            current_theme: "echoes".to_string(),
            site_keyword: "echoes".to_string(),
            site_description: "echoes是一个高效、可扩展的博客平台".to_string(),
            admin_path: "admin".to_string(),
        }
    }
}

pub async fn get_setting(
    sql: &sql::Database,
    comfig_type: String,
    name: String,
) -> CustomResult<Json<Value>> {
    let name_condition = builder::Condition::new(
        "name".to_string(),
        builder::Operator::Eq,
        Some(builder::SafeValue::Text(
            format!("{}_{}", comfig_type, name),
            builder::ValidationLevel::Strict,
        )),
    )?;

    let where_clause = builder::WhereClause::Condition(name_condition);

    let mut sql_builder = builder::QueryBuilder::new(
        builder::SqlOperation::Select,
        sql.table_name("settings"),
        sql.get_type(),
    )?;

    sql_builder
        .add_condition(where_clause)
        .add_field("data".to_string())?;
    println!("{:?}", sql_builder.build());

    let result = sql.get_db().execute_query(&sql_builder).await?;
    Ok(Json(json!(result)))
}

pub async fn insert_setting(
    sql: &sql::Database,
    comfig_type: String,
    name: String,
    data: Json<Value>,
) -> CustomResult<()> {
    let mut builder = builder::QueryBuilder::new(
        builder::SqlOperation::Insert,
        sql.table_name("settings"),
        sql.get_type(),
    )?;
    builder.set_value(
        "name".to_string(),
        builder::SafeValue::Text(
            format!("{}_{}", comfig_type, name).to_string(),
            builder::ValidationLevel::Strict,
        ),
    )?;
    builder.set_value(
        "data".to_string(),
        builder::SafeValue::Text(data.to_string(), builder::ValidationLevel::Relaxed),
    )?;
    sql.get_db().execute_query(&builder).await?;
    Ok(())
}

#[get("/system")]
pub async fn system_config_get(
    state: &State<Arc<AppState>>,
    _token: SystemToken,
) -> AppResult<Json<Value>> {
    let sql = state.sql_get().await.into_app_result()?;
    let settings = get_setting(&sql, "system".to_string(), sql.table_name("settings"))
        .await
        .into_app_result()?;
    Ok(settings)
}

#[get("/theme/<name>")]
pub async fn theme_config_get(
    state: &State<Arc<AppState>>,
    _token: SystemToken,
    name: String,
) -> AppResult<Json<Value>> {
    let sql = state.sql_get().await.into_app_result()?;
    let settings = get_setting(&sql, "theme".to_string(), name)
        .await
        .into_app_result()?;
    Ok(settings)
}
