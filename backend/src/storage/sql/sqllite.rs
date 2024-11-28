use super::{
    builder::{self, SafeValue},
    schema, DatabaseTrait,
};
use crate::common::error::{CustomError, CustomErrorInto, CustomResult};
use crate::config;
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde_json::Value;
use sqlx::{Column, Executor, SqlitePool, Row, TypeInfo};
use std::collections::HashMap;
use std::env;

#[derive(Clone)]
pub struct Sqlite {
    pool: SqlitePool,
}

#[async_trait]
impl DatabaseTrait for Sqlite {
    async fn initialization(db_config: config::SqlConfig) -> CustomResult<()> {
        let db_prefix = SafeValue::Text(
            format!("{}", db_config.db_prefix),
            builder::ValidationLevel::Strict,
        );
        
        let sqlite_dir = env::current_dir()?.join("assets").join("sqllite");
        std::fs::create_dir_all(&sqlite_dir)?;
        
        let db_file = sqlite_dir.join(&db_config.db_name);
        std::fs::File::create(&db_file)?;
        
        let path = db_file.to_str().ok_or("Unable to get sqllite path".into_custom_error())?;
        let grammar = schema::generate_schema(schema::DatabaseType::SQLite, db_prefix)?;

        let connection_str = format!("sqlite:///{}", path);
        let pool = SqlitePool::connect(&connection_str).await?;

        pool.execute(grammar.as_str()).await?;

        Ok(())
    }

    async fn connect(db_config: &config::SqlConfig) -> CustomResult<Self> {
        let db_file = env::current_dir()?
            .join("assets")
            .join("sqllite")
            .join(&db_config.db_name);
        
        if !db_file.exists() {
            return Err("SQLite database file does not exist".into_custom_error());
        }
        
        let path = db_file.to_str().ok_or("Unable to get sqllite path".into_custom_error())?;
        let connection_str = format!("sqlite:///{}", path);
        let pool = SqlitePool::connect(&connection_str).await?;

        Ok(Sqlite { pool })
    }

    async fn execute_query<'a>(
        &'a self,
        builder: &builder::QueryBuilder,
    ) -> CustomResult<Vec<HashMap<String, Value>>> {
        let (query, values) = builder.build()?;

        let mut sqlx_query = sqlx::query(&query);

        for value in values {
            match value {
                SafeValue::Null => sqlx_query = sqlx_query.bind(None::<String>),
                SafeValue::Bool(b) => sqlx_query = sqlx_query.bind(b),
                SafeValue::Integer(i) => sqlx_query = sqlx_query.bind(i),
                SafeValue::Float(f) => sqlx_query = sqlx_query.bind(f),
                SafeValue::Text(s, _) => sqlx_query = sqlx_query.bind(s),
                SafeValue::DateTime(dt) => sqlx_query = sqlx_query.bind(dt.to_rfc3339()),
            }
        }

        let rows = sqlx_query.fetch_all(&self.pool).await?;

        Ok(rows
            .into_iter()
            .map(|row| {
                row.columns()
                    .iter()
                    .map(|col| {
                        let value = match col.type_info().name() {
                            "INTEGER" => Value::Number(
                                row.try_get::<i64, _>(col.name()).unwrap_or_default().into(),
                            ),
                            "REAL" => Value::Number(
                                serde_json::Number::from_f64(
                                    row.try_get::<f64, _>(col.name()).unwrap_or(0.0),
                                )
                                .unwrap_or_else(|| 0.into()),
                            ),
                            "BOOLEAN" => Value::Bool(row.try_get(col.name()).unwrap_or_default()),
                            _ => Value::String(row.try_get(col.name()).unwrap_or_default()),
                        };
                        (col.name().to_string(), value)
                    })
                    .collect()
            })
            .collect())
    }
}
