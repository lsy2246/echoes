// config/mod.rs
/*
   配置文件结构和操作
*/

use serde::Deserialize;
use std::{env, fs};

#[derive(Deserialize)]
pub struct Config {
    pub info: Info, // 配置信息
    pub sql_config: SqlConfig, // 关系型数据库配置
    // pub no_sql_config:NoSqlConfig, 非关系型数据库配置
}

#[derive(Deserialize)]
pub struct Info {
    pub install: bool, // 是否安装
    pub non_relational: bool, // 是否非关系型
}

#[derive(Deserialize)]
pub struct SqlConfig {
    pub db_type: String, // 数据库类型
    pub address: String, // 地址
    pub prot: u32, // 端口
    pub user: String, // 用户名
    pub password: String, // 密码
    pub db_name: String, // 数据库名称
}

#[derive(Deserialize)]
pub struct NoSqlConfig {
    pub db_type: String, // 数据库类型
    pub address: String, // 地址
    pub prot: u32, // 端口
    pub user: String, // 用户名
    pub password: String, // 密码
    pub db_name: String, // 数据库名称
}


impl Config {
    /// 读取配置文件
    pub fn read() -> Result<Self, Box<dyn std::error::Error>> {
        let path = env::current_dir()?
            .join("assets")
            .join("config.toml");
        Ok(toml::from_str(&fs::read_to_string(path)?)?)
    }
}
