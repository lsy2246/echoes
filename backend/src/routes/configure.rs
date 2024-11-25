use super::SystemToken;
use crate::database::{relational, relational::builder};
use crate::error::{AppResult, AppResultInto, CustomResult};
use crate::AppState;
use rocket::{
    get,
    http::Status,
    response::status,
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
    pub site_keyword: Vec<String>,
    pub site_description: String,
    pub admin_path: String,
}

impl Default for SystemConfigure {
    fn default() -> Self {
        Self {
            author_name: "lsy".to_string(),
            current_theme: "default".to_string(),
            site_keyword: vec!["echoes".to_string()],
            site_description: "echoes是一个高效、可扩展的博客平台".to_string(),
            admin_path: "admin".to_string(),
        }
    }
}

pub async fn get_configure(
    sql: &relational::Database,
    comfig_type: String,
    name: String,
) -> CustomResult<Json<Value>> {
    let name_condition = builder::Condition::new(
        "config_name".to_string(),
        builder::Operator::Eq,
        Some(builder::SafeValue::Text(
            format!("{}_{}", comfig_type, name),
            builder::ValidationLevel::Strict,
        )),
    )?;

    println!(
        "Searching for config_name: {}",
        format!("{}_{}", comfig_type, name)
    );

    let where_clause = builder::WhereClause::Condition(name_condition);

    let mut sql_builder =
        builder::QueryBuilder::new(builder::SqlOperation::Select, "config".to_string())?;
    sql_builder
        .add_condition(where_clause)
        .add_field("config_data".to_string())?;

    let result = sql.get_db().execute_query(&sql_builder).await?;
    Ok(Json(json!(result)))
}

pub async fn insert_configure(
    sql: &relational::Database,
    comfig_type: String,
    name: String,
    data: Json<Value>,
) -> CustomResult<()> {
    let mut builder =
        builder::QueryBuilder::new(builder::SqlOperation::Insert, "config".to_string())?;
    builder.set_value(
        "config_name".to_string(),
        builder::SafeValue::Text(
            format!("{}_{}", comfig_type, name).to_string(),
            builder::ValidationLevel::Strict,
        ),
    )?;
    builder.set_value(
        "config_data".to_string(),
        builder::SafeValue::Json(data.into_inner()),
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
    let configure = get_configure(&sql, "system".to_string(), "config".to_string())
        .await
        .into_app_result()?;
    Ok(configure)
}
