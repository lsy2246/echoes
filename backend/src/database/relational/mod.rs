mod postgresql;
use crate::config;
use async_trait::async_trait;
use std::collections::HashMap;
use crate::utils::CustomError;
use std::sync::Arc;
pub mod builder;

#[async_trait]
pub trait DatabaseTrait: Send + Sync {
    async fn connect(database: &config::SqlConfig) -> Result<Self, CustomError>
    where
        Self: Sized;
    async fn execute_query<'a>(
        &'a self,
        builder: &builder::QueryBuilder,
    ) -> Result<Vec<HashMap<String, String>>, CustomError>;
    async fn initialization(database: config::SqlConfig) -> Result<(), CustomError>
    where
        Self: Sized;
}

#[derive(Clone)]
pub struct Database {
    pub db: Arc<Box<dyn DatabaseTrait>>,
}

impl Database {
    pub fn get_db(&self) -> &Box<dyn DatabaseTrait> {
        &self.db
    }

    pub async fn link(database: &config::SqlConfig) -> Result<Self, CustomError> {
        let db = match database.db_type.as_str() {
            "postgresql" => postgresql::Postgresql::connect(database).await?,
            _ => return Err("unknown database type".into()),
        };

        Ok(Self {
            db: Arc::new(Box::new(db)),
        })
    }

    pub async fn initial_setup(database: config::SqlConfig) -> Result<(), CustomError> {
        match database.db_type.as_str() {
            "postgresql" => postgresql::Postgresql::initialization(database).await?,
            _ => return Err("unknown database type".into()),
        };
        Ok(())
    }
}
