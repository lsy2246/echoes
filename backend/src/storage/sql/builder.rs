use crate::common::error::{CustomErrorInto, CustomResult};
use chrono::{DateTime, Utc};
use regex::Regex;
use serde::Serialize;
use serde_json::Value as JsonValue;
use std::collections::HashMap;
use std::hash::Hash;
use uuid::Uuid;

#[derive(Debug, Clone, PartialEq, Eq, Hash, Copy, Serialize)]
pub enum ValidationLevel {
    Strict,
    Standard,
    Relaxed,
}

#[derive(Debug, Clone)]
pub struct TextValidator {
    sql_patterns: Vec<&'static str>,
    special_chars: Vec<char>,
    level_max_lengths: HashMap<ValidationLevel, usize>,
    level_allowed_chars: HashMap<ValidationLevel, Vec<char>>,
}

impl Default for TextValidator {
    fn default() -> Self {
        let level_max_lengths = HashMap::from([
            (ValidationLevel::Strict, 100),
            (ValidationLevel::Standard, 1000),
            (ValidationLevel::Relaxed, 100000),
        ]);

        let level_allowed_chars = HashMap::from([
            (ValidationLevel::Strict, vec!['_']),
            (
                ValidationLevel::Standard,
                vec!['_', '-', '.', ',', '!', '?', ':', ' '],
            ),
            (
                ValidationLevel::Relaxed,
                vec![
                    '_', '-', '.', ',', '!', '?', ':', ' ', '"', '\'', '(', ')', '[', ']', '{',
                    '}', '@', '#', '$', '%', '^', '&', '*', '+', '=', '<', '>', '/', '\\',
                ],
            ),
        ]);

        TextValidator {
            sql_patterns: vec![
                "DROP",
                "TRUNCATE",
                "ALTER",
                "DELETE",
                "UPDATE",
                "INSERT",
                "MERGE",
                "GRANT",
                "REVOKE",
                "UNION",
                "--",
                "/*",
                "EXEC",
                "EXECUTE",
                "WAITFOR",
                "DELAY",
                "BENCHMARK",
            ],
            special_chars: vec!['\0', '\n', '\r', '\t'],
            level_max_lengths,
            level_allowed_chars,
        }
    }
}

impl TextValidator {
    pub fn validate(&self, text: &str, level: ValidationLevel) -> CustomResult<()> {
        let max_length = self
            .level_max_lengths
            .get(&level)
            .ok_or("Invalid validation level".into_custom_error())?;

        if text.len() > *max_length {
            return Err("Text exceeds maximum length".into_custom_error());
        }

        if level == ValidationLevel::Relaxed {
            return self.validate_sql_patterns(text);
        }

        self.validate_chars(text, level)?;
        self.validate_special_chars(text)
    }

    fn validate_sql_patterns(&self, text: &str) -> CustomResult<()> {
        let upper_text = text.to_uppercase();
        if self
            .sql_patterns
            .iter()
            .any(|&pattern| upper_text.contains(&pattern.to_uppercase()))
        {
            return Err("Potentially dangerous SQL pattern detected".into_custom_error());
        }
        Ok(())
    }

    fn validate_chars(&self, text: &str, level: ValidationLevel) -> CustomResult<()> {
        let allowed_chars = self
            .level_allowed_chars
            .get(&level)
            .ok_or_else(|| "Invalid validation level".into_custom_error())?;

        if let Some(invalid_char) = text
            .chars()
            .find(|&c| !c.is_alphanumeric() && !allowed_chars.contains(&c))
        {
            return Err(
                format!("Invalid character '{}' for {:?} level", invalid_char, level)
                    .into_custom_error(),
            );
        }
        Ok(())
    }

    fn validate_special_chars(&self, text: &str) -> CustomResult<()> {
        if self.special_chars.iter().any(|&c| text.contains(c)) {
            return Err("Invalid special character detected".into_custom_error());
        }
        Ok(())
    }

    // 提供便捷方法
    pub fn validate_relaxed(&self, text: &str) -> CustomResult<()> {
        self.validate(text, ValidationLevel::Relaxed)
    }

    pub fn validate_standard(&self, text: &str) -> CustomResult<()> {
        self.validate(text, ValidationLevel::Standard)
    }

    pub fn validate_strict(&self, text: &str) -> CustomResult<()> {
        self.validate(text, ValidationLevel::Strict)
    }

    pub fn sanitize(&self, text: &str) -> CustomResult<String> {
        self.validate_relaxed(text)?;
        Ok(text.replace('\'', "''").replace('\\', "\\\\"))
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum SafeValue {
    Null,
    Bool(bool),
    Integer(i64),
    Float(f64),
    Text(String, ValidationLevel),
    DateTime(DateTime<Utc>),
    Uuid(Uuid),
    Binary(Vec<u8>),
    Array(Vec<SafeValue>),
    Json(JsonValue),
    Enum(String, String, ValidationLevel),
}

impl SafeValue {
    pub fn from_json(value: JsonValue, level: ValidationLevel) -> CustomResult<Self> {
        match value {
            JsonValue::Null => Ok(SafeValue::Null),
            JsonValue::Bool(b) => Ok(SafeValue::Bool(b)),
            JsonValue::Number(n) => {
                if let Some(i) = n.as_i64() {
                    Ok(SafeValue::Integer(i))
                } else if let Some(f) = n.as_f64() {
                    Ok(SafeValue::Float(f))
                } else {
                    Err("Invalid number format".into_custom_error())
                }
            }
            JsonValue::String(s) => {
                TextValidator::default().validate(&s, level)?;
                Ok(SafeValue::Text(s, level))
            }
            JsonValue::Array(arr) => Ok(SafeValue::Array(
                arr.into_iter()
                    .map(|item| SafeValue::from_json(item, level))
                    .collect::<CustomResult<Vec<_>>>()?,
            )),
            JsonValue::Object(_) => {
                Self::validate_json_structure(&value, level)?;
                Ok(SafeValue::Json(value))
            }
        }
    }

    fn validate_json_structure(value: &JsonValue, level: ValidationLevel) -> CustomResult<()> {
        let validator = TextValidator::default();
        match value {
            JsonValue::Object(map) => {
                for (key, val) in map {
                    validator.validate(key, level)?;
                    Self::validate_json_structure(val, level)?;
                }
            }
            JsonValue::Array(arr) => {
                arr.iter()
                    .try_for_each(|item| Self::validate_json_structure(item, level))?;
            }
            JsonValue::String(s) => validator.validate(s, level)?,
            _ => {}
        }
        Ok(())
    }

    fn get_sql_type(&self) -> CustomResult<String> {
        let sql_type = match self {
            SafeValue::Null => "NULL",
            SafeValue::Bool(_) => "boolean",
            SafeValue::Integer(_) => "bigint",
            SafeValue::Float(_) => "double precision",
            SafeValue::Text(_, _) => "text",
            SafeValue::DateTime(_) => "timestamp with time zone",
            SafeValue::Uuid(_) => "uuid",
            SafeValue::Binary(_) => "bytea",
            SafeValue::Array(_) | SafeValue::Json(_) => "jsonb",
            SafeValue::Enum(_, enum_type, level) => {
                TextValidator::default().validate(enum_type, *level)?;
                return Ok(enum_type.replace('\'', "''"));
            }
        };
        Ok(sql_type.to_string())
    }

    pub fn to_sql_string(&self) -> CustomResult<String> {
        match self {
            SafeValue::Null => Ok("NULL".to_string()),
            SafeValue::Bool(b) => Ok(b.to_string()),
            SafeValue::Integer(i) => Ok(i.to_string()),
            SafeValue::Float(f) => Ok(f.to_string()),
            SafeValue::Text(s, level) => {
                TextValidator::default().validate(s, *level)?;
                Ok(s.replace('\'', "''"))
            }
            SafeValue::DateTime(dt) => Ok(format!("'{}'", dt.to_rfc3339())),
            SafeValue::Uuid(u) => Ok(format!("'{}'", u)),
            SafeValue::Binary(b) => Ok(format!("'\\x{}'", hex::encode(b))),
            SafeValue::Array(arr) => {
                let values: CustomResult<Vec<_>> = arr.iter().map(|v| v.to_sql_string()).collect();
                Ok(format!("ARRAY[{}]", values?.join(",")))
            }
            SafeValue::Json(j) => {
                let json_str = serde_json::to_string(j)?;
                TextValidator::default().validate(&json_str, ValidationLevel::Relaxed)?;
                Ok(json_str.replace('\'', "''"))
            }
            SafeValue::Enum(s, _, level) => {
                TextValidator::default().validate(s, *level)?;
                Ok(s.to_string())
            }
        }
    }

    fn to_param_sql(&self, param_index: usize) -> CustomResult<String> {
        if matches!(self, SafeValue::Null) {
            Ok("NULL".to_string())
        } else {
            Ok(format!("${}::{}", param_index, self.get_sql_type()?))
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct Identifier(String);

impl Identifier {
    pub fn new(value: String) -> CustomResult<Self> {
        let valid_pattern = Regex::new(r"^[a-zA-Z][a-zA-Z0-9_\.]{0,63}$")?;
        if !valid_pattern.is_match(&value) {
            return Err("Invalid identifier format".into_custom_error());
        }
        Ok(Identifier(value))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum SqlOperation {
    Select,
    Insert,
    Update,
    Delete,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Operator {
    Eq,
    Ne,
    Gt,
    Lt,
    Gte,
    Lte,
    Like,
    In,
    IsNull,
    IsNotNull,
    JsonContains,
    JsonExists,
}

impl Operator {
    fn as_str(&self) -> &'static str {
        match self {
            Operator::Eq => "=",
            Operator::Ne => "!=",
            Operator::Gt => ">",
            Operator::Lt => "<",
            Operator::Gte => ">=",
            Operator::Lte => "<=",
            Operator::Like => "LIKE",
            Operator::In => "IN",
            Operator::IsNull => "IS NULL",
            Operator::IsNotNull => "IS NOT NULL",
            Operator::JsonContains => "@>",
            Operator::JsonExists => "?",
        }
    }
}

#[derive(Debug, Clone)]
pub struct Condition {
    field: Identifier,
    operator: Operator,
    value: Option<SafeValue>,
}

impl Condition {
    pub fn new(field: String, operator: Operator, value: Option<SafeValue>) -> CustomResult<Self> {
        Ok(Condition {
            field: Identifier::new(field)?,
            operator,
            value,
        })
    }
}

#[derive(Debug, Clone)]
pub enum WhereClause {
    And(Vec<WhereClause>),
    Or(Vec<WhereClause>),
    Condition(Condition),
}

#[derive(Debug, Clone)]
pub struct QueryBuilder {
    operation: SqlOperation,
    table: Identifier,
    fields: Vec<Identifier>,
    values: HashMap<Identifier, SafeValue>,
    where_clause: Option<WhereClause>,
    order_by: Option<Identifier>,
    limit: Option<i32>,
    offset: Option<i32>,
}

impl QueryBuilder {
    pub fn new(operation: SqlOperation, table: String) -> CustomResult<Self> {
        Ok(QueryBuilder {
            operation,
            table: Identifier::new(table)?,
            fields: Vec::new(),
            values: HashMap::new(),
            where_clause: None,
            order_by: None,
            limit: None,
            offset: None,
        })
    }

    pub fn add_field(&mut self, field: String) -> CustomResult<&mut Self> {
        self.fields.push(Identifier::new(field)?);
        Ok(self)
    }

    pub fn set_value(&mut self, field: String, value: SafeValue) -> CustomResult<&mut Self> {
        self.values.insert(Identifier::new(field)?, value);
        Ok(self)
    }

    pub fn add_condition(&mut self, condition: WhereClause) -> &mut Self {
        self.where_clause = Some(condition);
        self
    }

    pub fn build(&self) -> CustomResult<(String, Vec<SafeValue>)> {
        let mut query = String::new();
        let mut params = Vec::new();

        match self.operation {
            SqlOperation::Select => self.build_select(&mut query)?,
            SqlOperation::Insert => self.build_insert(&mut query, &mut params)?,
            SqlOperation::Update => self.build_update(&mut query, &mut params)?,
            SqlOperation::Delete => query.push_str(&format!("DELETE FROM {}", self.table.as_str())),
        }

        if let Some(where_clause) = &self.where_clause {
            query.push_str(" WHERE ");
            let (where_sql, where_params) = self.build_where_clause(where_clause)?;
            query.push_str(&where_sql);
            params.extend(where_params);
        }

        self.build_pagination(&mut query)?;
        Ok((query, params))
    }

    fn build_select(&self, query: &mut String) -> CustomResult<()> {
        let fields = if self.fields.is_empty() {
            "*".to_string()
        } else {
            self.fields
                .iter()
                .map(|f| f.as_str())
                .collect::<Vec<_>>()
                .join(", ")
        };
        query.push_str(&format!("SELECT {} FROM {}", fields, self.table.as_str()));
        Ok(())
    }

    fn build_insert(&self, query: &mut String, params: &mut Vec<SafeValue>) -> CustomResult<()> {
        let mut fields = Vec::new();
        let mut placeholders = Vec::new();

        for (field, value) in &self.values {
            fields.push(field.as_str());
            if matches!(value, SafeValue::Null) {
                placeholders.push("NULL".to_string());
            } else {
                placeholders.push(format!("${}::{}", params.len() + 1, value.get_sql_type()?));
                params.push(value.clone());
            }
        }

        query.push_str(&format!(
            "INSERT INTO {} ({}) VALUES ({})",
            self.table.as_str(),
            fields.join(", "),
            placeholders.join(", ")
        ));

        Ok(())
    }

    fn build_update(&self, query: &mut String, params: &mut Vec<SafeValue>) -> CustomResult<()> {
        query.push_str(&format!("UPDATE {} SET ", self.table.as_str()));

        let mut updates = Vec::new();
        for (field, value) in &self.values {
            let set_sql = format!(
                "{} = {}",
                field.as_str(),
                value.to_param_sql(params.len() + 1)?
            );
            if !matches!(value, SafeValue::Null) {
                params.push(value.clone());
            }
            updates.push(set_sql);
        }

        query.push_str(&updates.join(", "));
        Ok(())
    }

    fn build_delete(&self, query: &mut String) -> CustomResult<()> {
        query.push_str(&format!("DELETE FROM {}", self.table.as_str()));
        Ok(())
    }

    fn build_where_clause(&self, clause: &WhereClause) -> CustomResult<(String, Vec<SafeValue>)> {
        let mut params = Vec::new();
        let mut param_index = 1; // 添加参数索引计数器

        let sql = match clause {
            WhereClause::And(conditions) => {
                let mut parts = Vec::new();
                for condition in conditions {
                    let (sql, mut condition_params) =
                        self.build_where_clause_with_index(condition, param_index)?;
                    param_index += condition_params.len(); // 更新参数索引
                    parts.push(sql);
                    params.append(&mut condition_params);
                }
                format!("({})", parts.join(" AND "))
            }
            WhereClause::Or(conditions) => {
                let mut parts = Vec::new();
                for condition in conditions {
                    let (sql, mut condition_params) =
                        self.build_where_clause_with_index(condition, param_index)?;
                    param_index += condition_params.len();
                    parts.push(sql);
                    params.append(&mut condition_params);
                }
                format!("({})", parts.join(" OR "))
            }
            WhereClause::Condition(condition) => {
                self.build_condition(condition, &mut params, param_index)?
            }
        };

        Ok((sql, params))
    }

    fn build_where_clause_with_index(
        &self,
        clause: &WhereClause,
        start_index: usize,
    ) -> CustomResult<(String, Vec<SafeValue>)> {
        let mut params = Vec::new();

        let sql = match clause {
            WhereClause::Condition(condition) => {
                self.build_condition(condition, &mut params, start_index)?
            }
            _ => {
                let (sql, params_inner) = self.build_where_clause(clause)?;
                params = params_inner;
                sql
            }
        };

        Ok((sql, params))
    }

    fn build_condition(
        &self,
        condition: &Condition,
        params: &mut Vec<SafeValue>,
        param_index: usize,
    ) -> CustomResult<String> {
        match &condition.value {
            Some(value) => {
                let sql = format!(
                    "{} {} {}",
                    condition.field.as_str(),
                    condition.operator.as_str(),
                    value.to_param_sql(param_index)?
                );
                if !matches!(value, SafeValue::Null) {
                    params.push(value.clone());
                }
                Ok(sql)
            }
            None => Ok(format!(
                "{} {}",
                condition.field.as_str(),
                condition.operator.as_str()
            )),
        }
    }

    // 构建分页
    fn build_pagination(&self, query: &mut String) -> CustomResult<()> {
        if let Some(order) = &self.order_by {
            query.push_str(&format!(" ORDER BY {}", order.as_str()));
        }

        if let Some(limit) = self.limit {
            query.push_str(&format!(" LIMIT {}", limit));
        }

        if let Some(offset) = self.offset {
            query.push_str(&format!(" OFFSET {}", offset));
        }

        Ok(())
    }
}
