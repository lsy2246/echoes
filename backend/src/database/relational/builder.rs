use regex::Regex;
use crate::utils::CustomError;
use std::collections::HashMap;
use std::hash::Hash;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum ValidatedValue {
    Identifier(String),
    RichText(String),
    PlainText(String),
}

impl ValidatedValue {
    pub fn new_identifier(value: String) -> Result<Self, CustomError> {
        let valid_pattern = Regex::new(r"^[a-zA-Z][a-zA-Z0-9_]{0,63}$").unwrap();
        if !valid_pattern.is_match(&value) {
            return Err(CustomError::from_str("Invalid identifier format"));
        }
        Ok(ValidatedValue::Identifier(value))
    }

    pub fn new_rich_text(value: String) -> Result<Self, CustomError> {
        let dangerous_patterns = [
            "UNION ALL SELECT",
            "UNION SELECT",
            "OR 1=1",
            "OR '1'='1",
            "DROP TABLE",
            "DELETE FROM",
            "UPDATE ",
            "INSERT INTO",
            "--",
            "/*",
            "*/",
            "@@",
        ];

        let value_upper = value.to_uppercase();
        for pattern in dangerous_patterns.iter() {
            if value_upper.contains(&pattern.to_uppercase()) {
                return Err(CustomError::from_str("Invalid identifier format"));
            }
        }
        Ok(ValidatedValue::RichText(value))
    }

    pub fn new_plain_text(value: String) -> Result<Self, CustomError> {
        if value.contains(';') || value.contains("--") {
            return Err(CustomError::from_str("Invalid characters in text"));
        }
        Ok(ValidatedValue::PlainText(value))
    }

    pub fn get(&self) -> &str {
        match self {
            ValidatedValue::Identifier(s)
            | ValidatedValue::RichText(s)
            | ValidatedValue::PlainText(s) => s,
        }
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
        }
    }
}

#[derive(Debug, Clone)]
pub struct WhereCondition {
    field: ValidatedValue,
    operator: Operator,
    value: Option<ValidatedValue>,
}

impl WhereCondition {
    pub fn new(
        field: String,
        operator: Operator,
        value: Option<String>,
    ) -> Result<Self, CustomError> {
        let field = ValidatedValue::new_identifier(field)?;

        let value = match value {
            Some(v) => Some(match operator {
                Operator::Like => ValidatedValue::new_plain_text(v)?,
                _ => ValidatedValue::new_plain_text(v)?,
            }),
            None => None,
        };

        Ok(WhereCondition {
            field,
            operator,
            value,
        })
    }
}

#[derive(Debug, Clone)]
pub enum WhereClause {
    And(Vec<WhereClause>),
    Or(Vec<WhereClause>),
    Condition(WhereCondition),
}
#[derive(Debug, Clone)]
pub struct QueryBuilder {
    operation: SqlOperation,
    table: ValidatedValue,
    fields: Vec<ValidatedValue>,
    params: HashMap<ValidatedValue, ValidatedValue>,
    where_clause: Option<WhereClause>,
    order_by: Option<ValidatedValue>,
    limit: Option<i32>,
}

impl QueryBuilder {
    pub fn new(operation: SqlOperation, table: String) -> Result<Self, CustomError> {
        Ok(QueryBuilder {
            operation,
            table: ValidatedValue::new_identifier(table)?,
            fields: Vec::new(),
            params: HashMap::new(),
            where_clause: None,
            order_by: None,
            limit: None,
        })
    }

    pub fn build(&self) -> Result<(String, Vec<String>), CustomError> {
        let mut query = String::new();
        let mut values = Vec::new();
        let mut param_counter = 1;

        match self.operation {
            SqlOperation::Select => {
                let fields = if self.fields.is_empty() {
                    "*".to_string()
                } else {
                    self.fields
                        .iter()
                        .map(|f| f.get().to_string())
                        .collect::<Vec<_>>()
                        .join(", ")
                };
                query.push_str(&format!("SELECT {} FROM {}", fields, self.table.get()));
            }
            SqlOperation::Insert => {
                let fields: Vec<String> = self.params.keys().map(|k| k.get().to_string()).collect();
                let placeholders: Vec<String> =
                    (1..=self.params.len()).map(|i| format!("${}", i)).collect();

                query.push_str(&format!(
                    "INSERT INTO {} ({}) VALUES ({})",
                    self.table.get(),
                    fields.join(", "),
                    placeholders.join(", ")
                ));

                values.extend(self.params.values().map(|v| v.get().to_string()));
                return Ok((query, values));
            }
            SqlOperation::Update => {
                query.push_str(&format!("UPDATE {} SET ", self.table.get()));
                let set_clauses: Vec<String> = self
                    .params
                    .iter()
                    .map(|(key, _)| {
                        let placeholder = format!("${}", param_counter);
                        values.push(self.params[key].get().to_string());
                        param_counter += 1;
                        format!("{} = {}", key.get(), placeholder)
                    })
                    .collect();
                query.push_str(&set_clauses.join(", "));
            }
            SqlOperation::Delete => {
                query.push_str(&format!("DELETE FROM {}", self.table.get()));
            }
        }

        if let Some(where_clause) = &self.where_clause {
            query.push_str(" WHERE ");
            let (where_sql, where_values) = self.build_where_clause(where_clause, param_counter)?;
            query.push_str(&where_sql);
            values.extend(where_values);
        }

        if let Some(order) = &self.order_by {
            query.push_str(&format!(" ORDER BY {}", order.get()));
        }

        if let Some(limit) = self.limit {
            query.push_str(&format!(" LIMIT {}", limit));
        }

        Ok((query, values))
    }

    fn build_where_clause(
        &self,
        clause: &WhereClause,
        mut param_counter: i32,
    ) -> Result<(String, Vec<String>), CustomError> {
        let mut values = Vec::new();

        let sql = match clause {
            WhereClause::And(conditions) => {
                let mut parts = Vec::new();
                for condition in conditions {
                    let (sql, mut vals) = self.build_where_clause(condition, param_counter)?;
                    param_counter += vals.len() as i32;
                    parts.push(sql);
                    values.append(&mut vals);
                }
                format!("({})", parts.join(" AND "))
            }
            WhereClause::Or(conditions) => {
                let mut parts = Vec::new();
                for condition in conditions {
                    let (sql, mut vals) = self.build_where_clause(condition, param_counter)?;
                    param_counter += vals.len() as i32;
                    parts.push(sql);
                    values.append(&mut vals);
                }
                format!("({})", parts.join(" OR "))
            }
            WhereClause::Condition(cond) => {
                if let Some(value) = &cond.value {
                    let placeholder = format!("${}", param_counter);
                    values.push(value.get().to_string());
                    format!(
                        "{} {} {}",
                        cond.field.get(),
                        cond.operator.as_str(),
                        placeholder
                    )
                } else {
                    format!("{} {}", cond.field.get(), cond.operator.as_str())
                }
            }
        };

        Ok((sql, values))
    }
    pub fn fields(mut self, fields: Vec<ValidatedValue>) -> Self {
        self.fields = fields;
        self
    }

    pub fn params(mut self, params: HashMap<ValidatedValue, ValidatedValue>) -> Self {
        self.params = params;
        self
    }

    pub fn where_clause(mut self, clause: WhereClause) -> Self {
        self.where_clause = Some(clause);
        self
    }

    pub fn order_by(mut self, order: ValidatedValue) -> Self {
        self.order_by = Some(order);
        self
    }

    pub fn limit(mut self, limit: i32) -> Self {
        self.limit = Some(limit);
        self
    }
}
