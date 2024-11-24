use crate::error::CustomResult;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::{env, fs};

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Config {
    pub info: Info,
    pub sql_config: SqlConfig,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Info {
    pub install: bool,
    pub non_relational: bool,
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

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct NoSqlConfig {
    pub db_type: String,
    pub address: String,
    pub port: u32,
    pub user: String,
    pub password: String,
    pub db_name: String,
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
