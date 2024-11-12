// config/mod.rs
/*
   配置文件结构和操作
*/

use serde::Deserialize;
use std::{env, fs};

#[derive(Deserialize)]
pub struct Config {
    pub info: Info,
    pub db_config: DbConfig,
}

#[derive(Deserialize)]
pub struct Info {
    pub install: bool,
    pub non_relational: bool,
}

#[derive(Deserialize)]
pub struct DbConfig {
    pub db_type: String,
    pub address: String,
    pub prot: u32,
    pub user: String,
    pub password: String,
    pub db_name: String,
}

impl Config {
    /// 读取配置文件
    pub fn read() -> Result<Self, Box<dyn std::error::Error>> {
        let path = env::current_dir()?
            .join("config.toml");
        Ok(toml::from_str(&fs::read_to_string(path)?)?)
    }
}
