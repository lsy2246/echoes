mod postgresql;
use std::fs;
use tokio_postgres::{Error, Row};
use toml;
use crate::config::Config;
use async_trait::async_trait;

// 所有数据库类型
#[async_trait]
pub trait Database: Send + Sync {
     async fn query(&self,
             query: &str,
             params: &[&(dyn tokio_postgres::types::ToSql + Sync)])
             -> Result<Vec<Row>, Error>;
    async fn execute(
        &self,
        data: &str,
        params: &[&(dyn tokio_postgres::types::ToSql + Sync)],
    )
        -> Result<u64, Error>;
}


// 加载对应数据库
pub async fn loading() -> Option<Box<dyn Database>> {
    let config_string = fs::read_to_string("./src/config.toml")
        .expect("Could not load config file");
    let config: Config = toml::de::from_str(config_string.as_str()).expect("Could not parse config");
    let address = config.database.address;
    let port = config.database.prot;
    let user = config.database.user;
    let password = config.database.password;
    let dbname = config.database.dbname;
    let sql_instance: Box<dyn Database>;

    match config.database.ilk.as_str() {
        "postgresql" => {
            let sql = postgresql::connect(address, port, user, password, dbname).await;
            match sql {
                Ok(conn) => {
                    sql_instance = Box::new(conn);
                }
                Err(e) => {
                    println!("Database connection failed {}", e);
                    return None;
                }
            }

        }
        _ => { return None }
    };
    Some(sql_instance)
}