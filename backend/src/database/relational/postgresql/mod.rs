// sql/psotgresql.rs
/*
    为postgresql数据库实现具体的方法
*/
use super::DatabaseTrait;
use crate::config;
use async_trait::async_trait;
use sqlx::{Column, PgPool, Row};
use std::{collections::HashMap, error::Error};

#[derive(Clone)]
pub struct Postgresql {
    pool: PgPool,
}

#[async_trait]
impl DatabaseTrait for Postgresql {
    async fn connect(db_config: config::DbConfig) -> Result<Self, Box<dyn Error>> {
        let connection_str = format!(
            "postgres://{}:{}@{}:{}/{}",
            db_config.user, db_config.password, db_config.address, db_config.prot, db_config.db_name
        );

        // 连接到数据库池
        let pool = PgPool::connect(&connection_str)
            .await
            .map_err(|e| Box::new(e) as Box<dyn Error>)?;

        // 返回Postgresql实例
        Ok(Postgresql { pool })
    }

    /**
     * 异步执行查询并返回结果。
     */
    async fn query<'a>(
        &'a self,
        query: String,
    ) -> Result<Vec<HashMap<String, String>>, Box<dyn Error + 'a>> {
        // 执行查询并获取所有行
        let rows = sqlx::query(&query)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| Box::new(e) as Box<dyn Error>)?;

        // 存储查询结果
        let mut results = Vec::new();

        // 遍历每一行并构建结果映射
        for row in rows {
            let mut map = HashMap::new();
            for column in row.columns() {
                // 获取列的值，若失败则使用默认值
                let value: String = row.try_get(column.name()).unwrap_or_default();
                map.insert(column.name().to_string(), value);
            }
            results.push(map);
        }

        // 返回查询结果
        Ok(results)
    }
}
