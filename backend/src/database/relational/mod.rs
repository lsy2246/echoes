mod postgresql;
use crate::config;
use crate::utils::{CustomError, CustomResult};
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
pub mod builder;

#[async_trait]
pub trait DatabaseTrait: Send + Sync {
    async fn connect(database: &config::SqlConfig) -> CustomResult<Self>
    where
        Self: Sized;
    async fn execute_query<'a>(
        &'a self,
        builder: &builder::QueryBuilder,
    ) -> CustomResult<Vec<HashMap<String, String>>>;
    async fn initialization(database: config::SqlConfig) -> CustomResult<()>
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

    pub async fn link(database: &config::SqlConfig) -> CustomResult<Self> {
        let db = match database.db_type.as_str() {
            "postgresql" => postgresql::Postgresql::connect(database).await?,
            _ => return Err(CustomError::from_str("unknown database type")),
        };

        Ok(Self {
            db: Arc::new(Box::new(db)),
        })
    }

    pub async fn initial_setup(database: config::SqlConfig) -> CustomResult<()> {
        match database.db_type.as_str() {
            "postgresql" => postgresql::Postgresql::initialization(database).await?,
            _ => return Err(CustomError::from_str("unknown database type")),
        };
        Ok(())
    }
}
