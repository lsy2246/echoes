use crate::common::error::CustomResult;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::{env, fs};

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Config {
    pub address: String,
    pub port: u32,
    pub init: Init,
    pub sql_config: SqlConfig,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            address: "0.0.0.0".to_string(),
            port: 22000,
            init: Init::default(),
            sql_config: SqlConfig::default(),
        }
    }
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Init {
    pub sql: bool,
    pub no_sql: bool,
    pub administrator: bool,
}

impl Default for Init {
    fn default() -> Self {
        Self {
            sql: false,
            no_sql: false,
            administrator: false,
        }
    }
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct SqlConfig {
    pub db_type: String,
    pub address: String,
    pub port: u32,
    pub user: String,
    pub password: String,
    pub db_name: String,
    pub db_prefix:String,
}

impl Default for SqlConfig {
    fn default() -> Self {
        Self {
            db_type: "sqllite".to_string(),
            address: "".to_string(),
            port: 0,
            user: "".to_string(),
            password: "".to_string(),
            db_name: "echoes".to_string(),
            db_prefix: "echoes_".to_string(),
        }
    }
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct NoSqlConfig {
    pub db_type: String,
    pub address: String,
    pub port: u32,
    pub user: String,
    pub password: String,
    pub db_name: String,
}

impl Default for NoSqlConfig {
    fn default() -> Self {
        Self {
            db_type: "postgresql".to_string(),
            address: "localhost".to_string(),
            port: 5432,
            user: "postgres".to_string(),
            password: "postgres".to_string(),
            db_name: "echoes".to_string(),
        }
    }
}

impl Config {
    pub fn read() -> CustomResult<Self> {
        let path = Self::get_path()?;
        Ok(toml::from_str(&fs::read_to_string(path)?)?)
    }
    pub fn write(config: Config) -> CustomResult<()> {
        let path = Self::get_path()?;
        fs::write(path, toml::to_string(&config)?)?;
        Ok(())
    }

    pub fn get_path() -> CustomResult<PathBuf> {
        Ok(env::current_dir()?.join("config.toml"))
    }
}
