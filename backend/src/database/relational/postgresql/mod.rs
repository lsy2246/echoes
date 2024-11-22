use super::{builder, DatabaseTrait};
use crate::config;
use crate::utils::CustomResult;
use async_trait::async_trait;
use sqlx::{Column, Executor, PgPool, Row};
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
            .join("database")
            .join("relational")
            .join("postgresql")
            .join("init.sql");
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
    ) -> CustomResult<Vec<HashMap<String, String>>> {
        let (query, values) = builder.build()?;

        let mut sqlx_query = sqlx::query(&query);

        for value in values {
            sqlx_query = sqlx_query.bind(value);
        }

        let rows = sqlx_query.fetch_all(&self.pool).await?;

        let mut results = Vec::new();
        for row in rows {
            let mut map = HashMap::new();
            for column in row.columns() {
                let value: String = row.try_get(column.name()).unwrap_or_default();
                map.insert(column.name().to_string(), value);
            }
            results.push(map);
        }

        Ok(results)
    }
}
