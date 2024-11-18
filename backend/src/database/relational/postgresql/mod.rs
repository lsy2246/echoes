// File path: src/database/relational/postgresql/mod.rs
/**
 * 该模块实现了与PostgreSQL数据库的交互功能。
 * 包含连接池的结构体定义，提供数据库操作的基础。
 */

use super::{DatabaseTrait, QueryBuilder};
use crate::config;
use async_trait::async_trait;
use sqlx::{Column, PgPool, Row, Executor};
use std::{collections::HashMap, error::Error};
use std::{env, fs};

#[derive(Clone)]
/// PostgreSQL数据库连接池结构体
pub struct Postgresql {
    /// 数据库连接池
    pool: PgPool,
}

#[async_trait]
impl DatabaseTrait for Postgresql {
    /**
     * 初始化数据库并执行初始化脚本。
     * 
     * # 参数
     * - `db_config`: 数据库配置
     * 
     * # 返回
     * - `Result<(), Box<dyn Error>>`: 初始化结果
     */
    async fn initialization(db_config: config::SqlConfig) -> Result<(), Box<dyn Error>> {
        let path = env::current_dir()?
            .join("src")
            .join("database")
            .join("relational")
            .join("postgresql")
            .join("init.sql");
        let grammar = fs::read_to_string(&path)?;

        // 创建初始连接（不指定数据库）
        let connection_str = format!("postgres://{}:{}@{}:{}", db_config.user, db_config.password, db_config.address, db_config.port);
        let pool = PgPool::connect(&connection_str).await?;

        // 创建数据库
        pool.execute(format!("CREATE DATABASE {}", db_config.db_name).as_str()).await?;

        // 连接到新数据库
        let new_connection_str = format!("postgres://{}:{}@{}:{}/{}", db_config.user, db_config.password, db_config.address, db_config.port, db_config.db_name);
        let new_pool = PgPool::connect(&new_connection_str).await?;

        // 执行初始化脚本
        new_pool.execute(grammar.as_str()).await?;

        Ok(())
    }

    /**
     * 连接到PostgreSQL数据库并返回Postgresql实例。
     * 
     * # 参数
     * - `db_config`: 数据库配置
     * 
     * # 返回
     * - `Result<Self, Box<dyn Error>>`: 连接结果
     */
    async fn connect(db_config: config::SqlConfig) -> Result<Self, Box<dyn Error>> {
        let connection_str = format!(
            "postgres://{}:{}@{}:{}/{}",
            db_config.user, db_config.password, db_config.address, db_config.port, db_config.db_name
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
     * 
     * # 参数
     * - `builder`: 查询构建器
     * 
     * # 返回
     * - `Result<Vec<HashMap<String, String>>, Box<dyn Error + 'a>>`: 查询结果
     */
    async fn execute_query<'a>(
        &'a self,
        builder: &QueryBuilder,
    ) -> Result<Vec<HashMap<String, String>>, Box<dyn Error + 'a>> {
        let (query, values) = builder.build();
        
        // 构建查询
        let mut sqlx_query = sqlx::query(&query);
        
        // 绑定参数
        for value in values {
            sqlx_query = sqlx_query.bind(value);
        }

        // 执行查询
        let rows = sqlx_query
            .fetch_all(&self.pool)
            .await
            .map_err(|e| Box::new(e) as Box<dyn Error>)?;

        // 处理结果
        let mut results = Vec::new();
        for row in rows {
            let mut map = HashMap::new();
            for column in row.columns() {
                let value: String = row.try_get(column.name()).unwrap_or_default();
                map.insert(column.name().to_string(), value);
            }
            results.push(map);
        }

        Ok(results)
    }
}
