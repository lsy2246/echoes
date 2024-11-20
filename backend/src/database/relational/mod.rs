mod postgresql;
use crate::config;
use async_trait::async_trait;
use std::collections::HashMap;
use std::error::Error;
use std::sync::Arc;
use std::fmt; 
pub mod builder;

#[derive(Debug)]
pub enum DatabaseError {
    ValidationError(String),
    SqlInjectionAttempt(String),
    InvalidParameter(String),
    ExecutionError(String),
}

impl fmt::Display for DatabaseError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            DatabaseError::ValidationError(msg) => write!(f, "Validation error: {}", msg),
            DatabaseError::SqlInjectionAttempt(msg) => write!(f, "SQL injection attempt: {}", msg),
            DatabaseError::InvalidParameter(msg) => write!(f, "Invalid parameter: {}", msg),
            DatabaseError::ExecutionError(msg) => write!(f, "Execution error: {}", msg),
        }
    }
}

impl Error for DatabaseError {}


#[async_trait]
pub trait DatabaseTrait: Send + Sync {
    async fn connect(database: config::SqlConfig) -> Result<Self, Box<dyn Error>>
    where
        Self: Sized;
    async fn execute_query<'a>(
        &'a self,
        builder: &builder::QueryBuilder,
    ) -> Result<Vec<HashMap<String, String>>, Box<dyn Error + 'a>>;
    async fn initialization(database: config::SqlConfig) -> Result<(), Box<dyn Error>>
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

    pub async fn link(database: config::SqlConfig) -> Result<Self, Box<dyn Error>> {
        let db = match database.db_type.as_str() {
            "postgresql" => postgresql::Postgresql::connect(database).await?,
            _ => return Err("unknown database type".into()),
        };

        Ok(Self {
            db: Arc::new(Box::new(db)),
        })
    }

    pub async fn initial_setup(database: config::SqlConfig) -> Result<(), Box<dyn Error>> {
        match database.db_type.as_str() {
            "postgresql" => postgresql::Postgresql::initialization(database).await?,
            _ => return Err("unknown database type".into()),
        };
        Ok(())
    }
}
