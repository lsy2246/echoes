use super::{builder, DatabaseTrait};
use crate::config;
use crate::common::error::CustomResult;
use async_trait::async_trait;
use serde_json::Value;
use sqlx::{Column, Executor, PgPool, Row, TypeInfo};
use std::collections::HashMap;
use std::{env, fs};
#[derive(Clone)]
pub struct Postgresql {
    pool: PgPool,
}

#[async_trait]
impl DatabaseTrait for Postgresql {
    async fn initialization(db_config: config::SqlConfig) -> CustomResult<()> {
        let path = env::current_dir()?
            .join("src")
            .join("storage")
            .join("sql")
            .join("postgresql")
            .join("schema.sql");
        let grammar = fs::read_to_string(&path)?;

        let connection_str = format!(
            "postgres://{}:{}@{}:{}",
            db_config.user, db_config.password, db_config.address, db_config.port
        );
        let pool = PgPool::connect(&connection_str).await?;

        pool.execute(format!("CREATE DATABASE {}", db_config.db_name).as_str())
            .await?;

        let new_connection_str = format!(
            "postgres://{}:{}@{}:{}/{}",
            db_config.user,
            db_config.password,
            db_config.address,
            db_config.port,
            db_config.db_name
        );
        let new_pool = PgPool::connect(&new_connection_str).await?;

        new_pool.execute(grammar.as_str()).await?;

        Ok(())
    }

    async fn connect(db_config: &config::SqlConfig) -> CustomResult<Self> {
        let connection_str = format!(
            "postgres://{}:{}@{}:{}/{}",
            db_config.user,
            db_config.password,
            db_config.address,
            db_config.port,
            db_config.db_name
        );

        let pool = PgPool::connect(&connection_str).await?;

        Ok(Postgresql { pool })
    }

    async fn execute_query<'a>(
        &'a self,
        builder: &builder::QueryBuilder,
    ) -> CustomResult<Vec<HashMap<String, Value>>> {
        let (query, values) = builder.build()?;

        let mut sqlx_query = sqlx::query(&query);

        for value in values {
            sqlx_query = sqlx_query.bind(value.to_sql_string()?);
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
                            "JSON" | "JSONB" => row.try_get(col.name()).unwrap_or(Value::Null),
                            _ => Value::String(row.try_get(col.name()).unwrap_or_default()),
                        };
                        (col.name().to_string(), value)
                    })
                    .collect()
            })
            .collect())
    }
}
