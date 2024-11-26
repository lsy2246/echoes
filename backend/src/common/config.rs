use crate::common::error::CustomResult;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::{env, fs};

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Config {
    pub address: String,
    pub port: u32,
    pub info: Info,
    pub sql_config: SqlConfig,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            address: "0.0.0.0".to_string(),
            port: 22000,
            info: Info::default(),
            sql_config: SqlConfig::default(),
        }
    }
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Info {
    pub install: bool,
    pub non_relational: bool,
}

impl Default for Info {
    fn default() -> Self {
        Self {
            install: false,
            non_relational: false,
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
}

impl Default for SqlConfig {
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
