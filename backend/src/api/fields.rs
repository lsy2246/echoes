use super::SystemToken;
use crate::common::error::{AppResult, AppResultInto, CustomErrorInto, CustomResult};
use crate::storage::sql::{
    self,
    builder::{self, Condition, Operator, SafeValue, SqlOperation, ValidationLevel, WhereClause},
};
use crate::AppState;
use rocket::serde::json::Json;
use rocket::{delete, get, post, put, State};
use serde_json::{from_str, json, to_value, Value};
use std::fmt::{Display, Formatter};
use std::sync::Arc;

#[derive(Clone)]
pub enum TargetType {
    Post,
    Page,
    Theme,
    System,
}

impl Display for TargetType {
    fn fmt(&self, f: &mut Formatter) -> std::fmt::Result {
        match self {
            TargetType::Post => write!(f, "post"),
            TargetType::Page => write!(f, "page"),
            TargetType::Theme => write!(f, "theme"),
            TargetType::System => write!(f, "system"),
        }
    }
}

impl TargetType {
    pub fn from_str(s: &str) -> CustomResult<Self> {
        match s.to_lowercase().as_str() {
            "post" => Ok(TargetType::Post),
            "page" => Ok(TargetType::Page),
            "theme" => Ok(TargetType::Theme),
            "system" => Ok(TargetType::System),
            _ => Err("无效的目标类型".into_custom_error()),
        }
    }
}

#[derive(Clone)]
pub enum FieldType {
    Data,
    Meta,
}

impl Display for FieldType {
    fn fmt(&self, f: &mut Formatter) -> std::fmt::Result {
        match self {
            FieldType::Data => write!(f, "data"),
            FieldType::Meta => write!(f, "meta"),
        }
    }
}

impl FieldType {
    pub fn from_str(s: &str) -> CustomResult<Self> {
        match s.to_lowercase().as_str() {
            "data" => Ok(FieldType::Data),
            "meta" => Ok(FieldType::Meta),
            _ => Err("无效的字段类型".into_custom_error()),
        }
    }
}

pub async fn insert_fields(
    sql: &sql::Database,
    target_type: TargetType,
    target_id: i64,
    field_type: FieldType,
    field_key: &str,
    field_value: &str,
) -> CustomResult<()> {
    let mut builder = builder::QueryBuilder::new(
        SqlOperation::Insert,
        sql.table_name("fields"),
        sql.get_type(),
    )?;
    builder.set_value(
        "target_type".to_string(),
        SafeValue::Text(target_type.to_string(), ValidationLevel::Strict),
    )?;
    builder.set_value("target_id".to_string(), SafeValue::Integer(target_id))?;
    builder.set_value(
        "field_type".to_string(),
        SafeValue::Text(field_type.to_string(), ValidationLevel::Raw),
    )?;
    builder.set_value(
        "field_key".to_string(),
        SafeValue::Text(field_key.to_string(), ValidationLevel::Raw),
    )?;
    builder.set_value(
        "field_value".to_string(),
        SafeValue::Text(field_value.to_string(), ValidationLevel::Raw),
    )?;
    sql.get_db().execute_query(&builder).await?;
    Ok(())
}

pub async fn get_field(
    sql: &sql::Database,
    target_type: TargetType,
    target_id: i64,
) -> CustomResult<Json<Value>> {
    let mut builder = builder::QueryBuilder::new(
        SqlOperation::Select,
        sql.table_name("fields"),
        sql.get_type(),
    )?;
    builder
        .add_field("field_type".to_string())?
        .add_field("field_key".to_string())?
        .add_field("field_value".to_string())?
        .add_condition(WhereClause::And(vec![
            WhereClause::Condition(Condition::new(
                "target_id".to_string(),
                Operator::Eq,
                Some(SafeValue::Integer(target_id)),
            )?),
            WhereClause::Condition(Condition::new(
                "target_type".to_string(),
                Operator::Eq,
                Some(SafeValue::Text(
                    target_type.to_string(),
                    ValidationLevel::Standard,
                )),
            )?),
        ]));
    let values = sql.get_db().execute_query(&builder).await?;

    let processed_values = values
        .into_iter()
        .map(|mut row| {
            if let Some(Value::String(field_value)) = row.get("field_value") {
                if let Ok(json_value) = from_str::<Value>(&field_value) {
                    row.insert("field_value".to_string(), json_value);
                }
            }
            row
        })
        .collect::<Vec<_>>();

    let json_value = to_value(processed_values)?;
    Ok(Json(json_value))
}

pub async fn delete_fields(
    sql: &sql::Database,
    target_type: TargetType,
    target_id: i64,
    field_type: FieldType,
    field_key: &str,
) -> CustomResult<()> {
    let mut builder = builder::QueryBuilder::new(
        SqlOperation::Delete,
        sql.table_name("fields"),
        sql.get_type(),
    )?;
    builder.set_value("target_id".to_string(), SafeValue::Integer(target_id))?;
    builder.set_value(
        "target_type".to_string(),
        SafeValue::Text(target_type.to_string(), ValidationLevel::Standard),
    )?;
    builder.set_value(
        "field_type".to_string(),
        SafeValue::Text(field_type.to_string(), ValidationLevel::Standard),
    )?;
    builder.set_value(
        "field_key".to_string(),
        SafeValue::Text(field_key.to_string(), ValidationLevel::Standard),
    )?;
    sql.get_db().execute_query(&builder).await?;
    Ok(())
}

pub async fn delete_all_fields(
    sql: &sql::Database,
    target_type: TargetType,
    target_id: i64,
) -> CustomResult<()> {
    let mut builder = builder::QueryBuilder::new(
        SqlOperation::Delete,
        sql.table_name("fields"),
        sql.get_type(),
    )?;
    builder.set_value("target_id".to_string(), SafeValue::Integer(target_id))?;
    builder.set_value(
        "target_type".to_string(),
        SafeValue::Text(target_type.to_string(), ValidationLevel::Standard),
    )?;
    sql.get_db().execute_query(&builder).await?;
    Ok(())
}

pub async fn update_field(
    sql: &sql::Database,
    target_type: TargetType,
    target_id: i64,
    field_type: FieldType,
    field_key: &str,
    field_value: &str,
) -> CustomResult<()> {
    let mut builder = builder::QueryBuilder::new(
        SqlOperation::Update,
        sql.table_name("fields"),
        sql.get_type(),
    )?;
    builder
        .set_value(
            "field_value".to_string(),
            SafeValue::Text(field_value.to_string(), ValidationLevel::Raw),
        )?
        .add_condition(WhereClause::And(vec![
            WhereClause::Condition(Condition::new(
                "target_type".to_string(),
                Operator::Eq,
                Some(SafeValue::Text(
                    target_type.to_string(),
                    ValidationLevel::Standard,
                )),
            )?),
            WhereClause::Condition(Condition::new(
                "target_id".to_string(),
                Operator::Eq,
                Some(SafeValue::Integer(target_id)),
            )?),
            WhereClause::Condition(Condition::new(
                "field_type".to_string(),
                Operator::Eq,
                Some(SafeValue::Text(
                    field_type.to_string(),
                    ValidationLevel::Standard,
                )),
            )?),
            WhereClause::Condition(Condition::new(
                "field_key".to_string(),
                Operator::Eq,
                Some(SafeValue::Text(
                    field_key.to_string(),
                    ValidationLevel::Standard,
                )),
            )?),
        ]));
    sql.get_db().execute_query(&builder).await?;
    Ok(())
}

#[get("/<target_type>/<target_id>")]
pub async fn get_field_handler(
    token: SystemToken,
    state: &State<Arc<AppState>>,
    target_type: &str,
    target_id: i64,
) -> AppResult<Json<Value>> {
    let sql = state.sql_get().await.into_app_result()?;
    let target_type = TargetType::from_str(&target_type).into_app_result()?;
    let values = get_field(&sql, target_type, target_id)
        .await
        .into_app_result()?;
    Ok(values)
}

#[post(
    "/<target_type>/<target_id>/<field_type>/<field_key>",
    data = "<data>",
    format = "application/json"
)]
pub async fn insert_field_handler(
    token: SystemToken,
    state: &State<Arc<AppState>>,
    target_type: &str,
    target_id: i64,
    field_type: &str,
    field_key: &str,
    data: Json<Value>,
) -> AppResult<String> {
    let sql = state.sql_get().await.into_app_result()?;
    let target_type = TargetType::from_str(&target_type).into_app_result()?;
    let data_str = data.to_string();
    let field_type = FieldType::from_str(&field_type).into_app_result()?;
    insert_fields(
        &sql,
        target_type.clone(),
        target_id.clone(),
        field_type.clone(),
        field_key.clone(),
        &data_str,
    )
    .await
    .into_app_result()?;
    Ok(format!(
        "操作:插入字段\n目标类型:{}\n目标ID:{}\n字段类型:{}\n字段名称:{}\n字段值:{}",
        target_type, target_id, field_type, field_key, data_str
    )
    .to_string())
}

#[delete("/<target_type>/<target_id>/<field_type>/<field_key>")]
pub async fn delete_field_handler(
    token: SystemToken,
    state: &State<Arc<AppState>>,
    target_type: &str,
    target_id: i64,
    field_type: &str,
    field_key: &str,
) -> AppResult<String> {
    let sql = state.sql_get().await.into_app_result()?;
    let target_type = TargetType::from_str(&target_type).into_app_result()?;
    let field_type = FieldType::from_str(&field_type).into_app_result()?;
    delete_fields(
        &sql,
        target_type.clone(),
        target_id.clone(),
        field_type.clone(),
        field_key.clone(),
    )
    .await
    .into_app_result()?;
    Ok(format!(
        "操作:删除单个字段\n目标类型:{}\n目标ID:{}\n字段类型:{}\n字段名称:{}\n",
        target_type, target_id, field_type, field_key
    )
    .to_string())
}
#[delete("/<target_type>/<target_id>")]
pub async fn delete_all_fields_handler(
    token: SystemToken,
    state: &State<Arc<AppState>>,
    target_type: &str,
    target_id: i64,
) -> AppResult<String> {
    let sql = state.sql_get().await.into_app_result()?;
    let target_type = TargetType::from_str(&target_type).into_app_result()?;
    delete_all_fields(&sql, target_type.clone(), target_id.clone())
        .await
        .into_app_result()?;
    Ok(format!(
        "操作:删除所有字段\n目标类型:{}\n目标ID:{}\n",
        target_type, target_id
    )
    .to_string())
}
#[put(
    "/<target_type>/<target_id>/<field_type>/<field_key>",
    data = "<data>",
    format = "application/json"
)]
pub async fn update_field_handler(
    token: SystemToken,
    state: &State<Arc<AppState>>,
    target_type: &str,
    target_id: i64,
    field_type: &str,
    field_key: &str,
    data: Json<Value>,
) -> AppResult<String> {
    let sql = state.sql_get().await.into_app_result()?;
    let target_type = TargetType::from_str(&target_type).into_app_result()?;
    let data_str = data.to_string();
    let field_type = FieldType::from_str(&field_type).into_app_result()?;
    update_field(
        &sql,
        target_type.clone(),
        target_id.clone(),
        field_type.clone(),
        field_key.clone(),
        &data_str,
    )
    .await
    .into_app_result()?;
    Ok(format!(
        "操作:更新字段\n目标类型:{}\n目标ID:{}\n字段类型:{}\n字段名称:{}\n字段值:{}",
        target_type, target_id, field_type, field_key, data_str
    )
    .to_string())
}
