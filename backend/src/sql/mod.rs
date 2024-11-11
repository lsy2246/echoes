// sql/mod.rs
/* 
    定义了数据库具有的特征和方法
*/
mod postgresql;
use std::collections::HashMap;
use super::config;
use async_trait::async_trait;
use std::error::Error;
use std::sync::Arc;


#[async_trait]
pub trait DatabaseTrait: Send + Sync {
    // 连接数据库
    async fn connect(database: config::Database) -> Result<Self, Box<dyn Error>> where Self: Sized;
    // 执行查询
    async fn query<'a>(&'a self, query: String) -> Result<Vec<HashMap<String, String>>, Box<dyn Error + 'a>>;
}

#[derive(Clone)]
pub struct Database {
    // 数据库实例
    pub db: Arc<Box<dyn DatabaseTrait>>,
}

impl Database {
    // 获取当前数据库实例
    pub fn get_db(&self) -> &Box<dyn DatabaseTrait> {
        &self.db
    }
    
    // 初始化数据库
    pub async fn init(database: config::Database) -> Result<Self, Box<dyn Error>> {
        let db = match database.db_type.as_str() {
            "postgresql" => postgresql::Postgresql::connect(database).await?,
            _ => return Err("unknown database type".into()),
        };

        Ok(Self { db: Arc::new(Box::new(db)) })
    }
}
