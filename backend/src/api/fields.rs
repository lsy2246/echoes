use crate::{
    common::error::{AppResult, CustomResult},
    storage::sql::{self, builder},
};
use builder::{SafeValue, SqlOperation, ValidationLevel};
use std::fmt::{Display, Formatter};
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

pub async fn insert_fields(
    sql: &sql::Database,
    target_type: TargetType,
    target_id: i64,
    field_type: FieldType,
    field_key: String,
    field_value: String,
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
        SafeValue::Text(field_key, ValidationLevel::Raw),
    )?;
    builder.set_value(
        "field_value".to_string(),
        SafeValue::Text(field_value, ValidationLevel::Raw),
    )?;
    sql.get_db().execute_query(&builder).await?;
    Ok(())
}
