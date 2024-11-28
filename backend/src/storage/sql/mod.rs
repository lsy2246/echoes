mod postgresql;
mod mysql;
mod sqllite;
pub mod builder;
mod schema;

use crate::config;
use crate::common::error::{CustomErrorInto, CustomResult};
use async_trait::async_trait;
use std::{collections::HashMap, sync::Arc};
use schema::DatabaseType;

#[async_trait] 
pub trait DatabaseTrait: Send + Sync {
    async fn connect(database: &config::SqlConfig) -> CustomResult<Self>
    where
        Self: Sized;
    async fn execute_query<'a>(
        &'a self,
        builder: &builder::QueryBuilder,
    ) -> CustomResult<Vec<HashMap<String, serde_json::Value>>>;
    async fn initialization(database: config::SqlConfig) -> CustomResult<()>
    where
        Self: Sized;
}

#[derive(Clone)]
pub struct Database {
    pub db: Arc<Box<dyn DatabaseTrait>>,
    pub prefix: Arc<String>,
    pub db_type: Arc<String>
}

impl Database {
    pub fn get_db(&self) -> &Box<dyn DatabaseTrait> {
        &self.db
    }

    pub fn get_prefix(&self) -> &str {
        &self.prefix
    }

    pub fn get_type(&self) -> DatabaseType {
        match self.db_type.as_str() {
            "postgresql" => DatabaseType::PostgreSQL,
            "mysql" => DatabaseType::MySQL,
            _ => DatabaseType::SQLite,
        }
    }

    pub fn table_name(&self, name: &str) -> String {
        format!("{}{}", self.prefix, name)
    }

    pub async fn link(database: &config::SqlConfig) -> CustomResult<Self> {
        let db: Box<dyn DatabaseTrait> = match database.db_type.as_str() {
            "postgresql" => Box::new(postgresql::Postgresql::connect(database).await?),
            "mysql" => Box::new(mysql::Mysql::connect(database).await?),
            "sqllite" => Box::new(sqllite::Sqlite::connect(database).await?),
            _ => return Err("unknown database type".into_custom_error()),
        };

        Ok(Self {
            db: Arc::new(db),
            prefix: Arc::new(database.db_prefix.clone()),
            db_type: Arc::new(database.db_type.clone())
        })
    }

    pub async fn initial_setup(database: config::SqlConfig) -> CustomResult<()> {
        match database.db_type.as_str() {
            "postgresql" => postgresql::Postgresql::initialization(database).await?,
            "mysql" => mysql::Mysql::initialization(database).await?,
            "sqllite" => sqllite::Sqlite::initialization(database).await?,
            _ => return Err("unknown database type".into_custom_error()),
        };
        Ok(())
    }
    
}
