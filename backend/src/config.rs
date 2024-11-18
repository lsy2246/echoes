use serde::Deserialize;
use std::{ env, fs};

#[derive(Deserialize,Debug,Clone)]
pub struct Config {
    pub info: Info,
    pub sql_config: SqlConfig,
}

#[derive(Deserialize,Debug,Clone)]
pub struct Info {
    pub install: bool,
    pub non_relational: bool,
}

#[derive(Deserialize,Debug,Clone)]
pub struct SqlConfig {
    pub db_type: String,
    pub address: String,
    pub port: u32,
    pub user: String,
    pub password: String,
    pub db_name: String,
}

#[derive(Deserialize,Debug,Clone)]
pub struct NoSqlConfig {
    pub db_type: String,
    pub address: String,
    pub port: u32,
    pub user: String,
    pub password: String,
    pub db_name: String,
}

impl Config {
    pub fn read() -> Result<Self, Box<dyn std::error::Error>> {
        let path = env::current_dir()?
            .join("assets")
            .join("config.toml");
        Ok(toml::from_str(&fs::read_to_string(path)?)?)
    }
}
