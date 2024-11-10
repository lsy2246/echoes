// mod.rs
mod postgresql;
use std::{collections::HashMap, fs};
use toml;
use crate::config::Config;
use async_trait::async_trait;
use std::error::Error;
use std::sync::Arc;

#[async_trait]
pub trait Databasetrait: Send + Sync {
    async fn connect(
        address: String,
        port: u32,
        user: String,
        password: String,
        dbname: String,
    ) -> Result<Self, Box<dyn Error>> where Self: Sized;
    async fn query<'a>(&'a self, query: String) -> Result<Vec<HashMap<String, String>>, Box<dyn Error + 'a>>;
}
#[derive(Clone)]
pub struct Database {
    pub db: Arc<Box<dyn Databasetrait>>,
}

impl Database {
    pub fn get_db(&self) -> &Box<dyn Databasetrait> {
        &self.db
    }
}



impl Database {
    pub async fn init() -> Result<Database, Box<dyn Error>> {
        let config_string = fs::read_to_string("./src/config.toml")
            .map_err(|e| Box::new(e) as Box<dyn Error>)?;
        let config: Config = toml::from_str(&config_string)
            .map_err(|e| Box::new(e) as Box<dyn Error>)?;

        match config.database.db_type.as_str() {
            "postgresql" => {
                let db = postgresql::Postgresql::connect(
                    config.database.address,
                    config.database.prot,
                    config.database.user,
                    config.database.password,
                    config.database.db_name,
                ).await?;
                Ok(Database {
                    db: Arc::new(Box::new(db))
                })
            }
            _ => Err(anyhow::anyhow!("unknown database type").into()),
        }
    }
}