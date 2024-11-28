use super::{builder::{self, SafeValue}, schema, DatabaseTrait};
use crate::config;
use crate::common::error::CustomResult;
use async_trait::async_trait;
use serde_json::Value;
use sqlx::mysql::MySqlPool;
use sqlx::{Column, Executor, Row, TypeInfo};
use std::collections::HashMap;
use chrono::{DateTime, Utc};

#[derive(Clone)]
pub struct Mysql {
    pool: MySqlPool,
}

#[async_trait]
impl DatabaseTrait for Mysql {
    async fn initialization(db_config: config::SqlConfig) -> CustomResult<()> {
        let db_prefix = SafeValue::Text(format!("{}",db_config.db_prefix), builder::ValidationLevel::Strict);
        let grammar = schema::generate_schema(schema::DatabaseType::MySQL,db_prefix)?;
        let connection_str = format!(
            "mysql://{}:{}@{}:{}",
            db_config.user, db_config.password, db_config.address, db_config.port
        );
        
        let pool = MySqlPool::connect(&connection_str).await?;
        
        pool.execute(format!("CREATE DATABASE `{}`", db_config.db_name).as_str()).await?;
        pool.execute(format!(
            "ALTER DATABASE `{}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci",
            db_config.db_name
        ).as_str()).await?;


        let new_connection_str = format!(
            "mysql://{}:{}@{}:{}/{}",
            db_config.user,
            db_config.password,
            db_config.address,
            db_config.port,
            db_config.db_name
        );
        let new_pool = MySqlPool::connect(&new_connection_str).await?;

        new_pool.execute(grammar.as_str()).await?;
        Ok(())
    }
    async fn connect(db_config: &config::SqlConfig) -> CustomResult<Self> {
        let connection_str = format!(
            "mysql://{}:{}@{}:{}/{}",
            db_config.user,
            db_config.password,
            db_config.address,
            db_config.port,
            db_config.db_name
        );

        let pool = MySqlPool::connect(&connection_str).await?;

        Ok(Mysql { pool })
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
                            "INT4" | "INT8" => Value::Number(
                                row.try_get::<i64, _>(col.name()).unwrap_or_default().into(),
                            ),
                            "FLOAT4" | "FLOAT8" => Value::Number(
                                serde_json::Number::from_f64(
                                    row.try_get::<f64, _>(col.name()).unwrap_or(0.0),
                                )
                                .unwrap_or_else(|| 0.into()),
                            ),
                            "BOOL" => Value::Bool(row.try_get(col.name()).unwrap_or_default()),
                            _ => Value::String(row.try_get(col.name()).unwrap_or_default()),
                        };
                        (col.name().to_string(), value)
                    })
                    .collect()
            })
            .collect())
    }

}