// config/mod.rs
/* 
    配置文件结构和操作
 */
use std::fs;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct Config {
    pub info: Info,
    pub database: Database,
}

#[derive(Deserialize)]
pub struct Info {
    pub install: bool,
}

#[derive(Deserialize)]
pub struct Database {
    pub db_type: String,
    pub address: String,
    pub prot: u32,
    pub user: String,
    pub password: String,
    pub db_name: String,
}

impl Config {
    /// 读取配置文件
    pub fn read(path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        Ok(toml::from_str(&fs::read_to_string(path)?)?)
    }
}
