mod postgresql;
use std::collections::HashMap;
use crate::config;
use async_trait::async_trait;
use std::error::Error;
use std::sync::Arc;

#[derive(Debug, Clone, PartialEq)]
pub enum SqlOperation {
    Select,
    Insert,
    Update,
    Delete,
}

pub struct QueryBuilder {
    operation: SqlOperation,
    table: String,
    fields: Vec<String>,
    params: HashMap<String, String>,
    where_conditions: HashMap<String, String>,
    order_by: Option<String>,
    limit: Option<i32>,
}

#[async_trait]
pub trait DatabaseTrait: Send + Sync {
    async fn connect(database: config::SqlConfig) -> Result<Self, Box<dyn Error>> where Self: Sized;
    async fn execute_query<'a>(
        &'a self,
        builder: &QueryBuilder,
    ) -> Result<Vec<HashMap<String, String>>, Box<dyn Error + 'a>>;
    async fn initialization(database: config::SqlConfig) -> Result<(), Box<dyn Error>> where Self: Sized;
}

#[derive(Clone)]
pub struct Database {
    pub db: Arc<Box<dyn DatabaseTrait>>,
}

impl Database {
    pub fn get_db(&self) -> &Box<dyn DatabaseTrait> {
        &self.db
    }
    
    pub async fn link(database: config::SqlConfig) -> Result<Self, Box<dyn Error>> {
        let db = match database.db_type.as_str() {
            "postgresql" => postgresql::Postgresql::connect(database).await?,
            _ => return Err("unknown database type".into()),
        };

        Ok(Self { db: Arc::new(Box::new(db)) })
    }

    pub async fn initial_setup(database: config::SqlConfig) -> Result<(), Box<dyn Error>> {
        match database.db_type.as_str() {
            "postgresql" => postgresql::Postgresql::initialization(database).await?,
            _ => return Err("unknown database type".into()),
        };
        Ok(())
    }
}

impl QueryBuilder {
    pub fn new(operation: SqlOperation, table: &str) -> Self {
        QueryBuilder {
            operation,
            table: table.to_string(),
            fields: Vec::new(),
            params: HashMap::new(),
            where_conditions: HashMap::new(),
            order_by: None,
            limit: None,
        }
    }

    pub fn build(&self) -> (String, Vec<String>) {
        let mut query = String::new();
        let mut values = Vec::new();
        let mut param_counter = 1;

        match self.operation {
            SqlOperation::Select => {
                let fields = if self.fields.is_empty() {
                    "*".to_string()
                } else {
                    self.fields.join(", ")
                };

                query.push_str(&format!("SELECT {} FROM {}", fields, self.table));

                if !self.where_conditions.is_empty() {
                    let conditions: Vec<String> = self.where_conditions
                        .iter()
                        .map(|(key, _)| {
                            let placeholder = format!("${}", param_counter);
                            values.push(self.where_conditions[key].clone());
                            param_counter += 1;
                            format!("{} = {}", key, placeholder)
                        })
                        .collect();
                    query.push_str(" WHERE ");
                    query.push_str(&conditions.join(" AND "));
                }
            },
            SqlOperation::Insert => {
                let fields: Vec<String> = self.params.keys().cloned().collect();
                let placeholders: Vec<String> = (1..=self.params.len())
                    .map(|i| format!("${}", i))
                    .collect();

                query.push_str(&format!(
                    "INSERT INTO {} ({}) VALUES ({})",
                    self.table,
                    fields.join(", "),
                    placeholders.join(", ")
                ));

                for field in fields {
                    values.push(self.params[&field].clone());
                }
            },
            SqlOperation::Update => {
                query.push_str(&format!("UPDATE {}", self.table));

                let set_clauses: Vec<String> = self.params
                    .keys()
                    .map(|key| {
                        let placeholder = format!("${}", param_counter);
                        values.push(self.params[key].clone());
                        param_counter += 1;
                        format!("{} = {}", key, placeholder)
                    })
                    .collect();

                query.push_str(" SET ");
                query.push_str(&set_clauses.join(", "));

                if !self.where_conditions.is_empty() {
                    let conditions: Vec<String> = self.where_conditions
                        .iter()
                        .map(|(key, _)| {
                            let placeholder = format!("${}", param_counter);
                            values.push(self.where_conditions[key].clone());
                            param_counter += 1;
                            format!("{} = {}", key, placeholder)
                        })
                        .collect();
                    query.push_str(" WHERE ");
                    query.push_str(&conditions.join(" AND "));
                }
            },
            SqlOperation::Delete => {
                query.push_str(&format!("DELETE FROM {}", self.table));

                if !self.where_conditions.is_empty() {
                    let conditions: Vec<String> = self.where_conditions
                        .iter()
                        .map(|(key, _)| {
                            let placeholder = format!("${}", param_counter);
                            values.push(self.where_conditions[key].clone());
                            param_counter += 1;
                            format!("{} = {}", key, placeholder)
                        })
                        .collect();
                    query.push_str(" WHERE ");
                    query.push_str(&conditions.join(" AND "));
                }
            }
        }

        if let Some(order) = &self.order_by {
            query.push_str(&format!(" ORDER BY {}", order));
        }

        if let Some(limit) = self.limit {
            query.push_str(&format!(" LIMIT {}", limit));
        }

        (query, values)
    }

    pub fn fields(&mut self, fields: Vec<String>) -> &mut Self {
        self.fields = fields;
        self
    }

    pub fn params(&mut self, params: HashMap<String, String>) -> &mut Self {
        self.params = params;
        self
    }

    pub fn where_conditions(&mut self, conditions: HashMap<String, String>) -> &mut Self {
        self.where_conditions = conditions;
        self
    }

    pub fn order_by(&mut self, order: &str) -> &mut Self {
        self.order_by = Some(order.to_string());
        self
    }

    pub fn limit(&mut self, limit: i32) -> &mut Self {
        self.limit = Some(limit);
        self
    }
}