// File path: src/database/relational/mod.rs

/** 
    本模块定义了数据库的特征和方法，包括查询构建器和数据库连接。
*/

mod postgresql;
use std::collections::HashMap;
use crate::config;
use async_trait::async_trait;
use std::error::Error;
use std::sync::Arc;

#[derive(Debug, Clone, PartialEq)]
pub enum SqlOperation {
    Select, // 查询操作
    Insert, // 插入操作
    Update, // 更新操作
    Delete, // 删除操作
}

/// 查询构建器结构
pub struct QueryBuilder {
    operation: SqlOperation, // SQL操作类型
    table: String, // 表名
    fields: Vec<String>, // 查询字段
    params: HashMap<String, String>, // 插入或更新的参数
    where_conditions: HashMap<String, String>, // WHERE条件
    order_by: Option<String>, // 排序字段
    limit: Option<i32>, // 限制返回的记录数
}

#[async_trait]
pub trait DatabaseTrait: Send + Sync {
    /** 
        连接数据库
        @param database 数据库配置
        @return Result<Self, Box<dyn Error>> 返回数据库实例或错误
    */
    async fn connect(database: config::SqlConfig) -> Result<Self, Box<dyn Error>> where Self: Sized;

    /** 
        执行查询
        @param query SQL查询语句
        @return Result<Vec<HashMap<String, String>>, Box<dyn Error + 'a>> 返回查询结果或错误
    */
    async fn execute_query<'a>(
        &'a self,
        builder: &QueryBuilder,
    ) -> Result<Vec<HashMap<String, String>>, Box<dyn Error + 'a>> ;
}

#[derive(Clone)]
pub struct Database {
    // 数据库实例
    pub db: Arc<Box<dyn DatabaseTrait>>,
}

impl Database {
    /** 
        获取当前数据库实例
        @return &Box<dyn DatabaseTrait> 返回数据库实例的引用
    */
    pub fn get_db(&self) -> &Box<dyn DatabaseTrait> {
        &self.db
    }
    
    /** 
        初始化数据库
        @param database 数据库配置
        @return Result<Self, Box<dyn Error>> 返回数据库实例或错误
    */
    pub async fn init(database: config::SqlConfig) -> Result<Self, Box<dyn Error>> {
        let db = match database.db_type.as_str() {
            "postgresql" => postgresql::Postgresql::connect(database).await?,
            _ => return Err("unknown database type".into()),
        };

        Ok(Self { db: Arc::new(Box::new(db)) })
    }
}

impl QueryBuilder {
    /** 
        创建新的查询构建器
        @param operation SQL操作类型
        @param table 表名
        @return Self 返回新的查询构建器实例
    */
    pub fn new(operation: SqlOperation, table: &str) -> Self {
        QueryBuilder {
            operation,
            table: table.to_string(),
            fields: Vec::new(),
            params: HashMap::new(),
            where_conditions: HashMap::new(),
            order_by: None,
            limit: None,
        }
    }

    /** 
        构建SQL语句和参数
        @return (String, Vec<String>) 返回构建的SQL语句和参数值
    */
    pub fn build(&self) -> (String, Vec<String>) {
        let mut query = String::new();
        let mut values = Vec::new();
        let mut param_counter = 1;

        match self.operation {
            SqlOperation::Select => {
                // SELECT 操作
                let fields = if self.fields.is_empty() {
                    "*".to_string()
                } else {
                    self.fields.join(", ")
                };

                query.push_str(&format!("SELECT {} FROM {}", fields, self.table));

                // 添加 WHERE 条件
                if !self.where_conditions.is_empty() {
                    let conditions: Vec<String> = self.where_conditions
                        .iter()
                        .map(|(key, _)| {
                            let placeholder = format!("${}", param_counter);
                            values.push(self.where_conditions[key].clone());
                            param_counter += 1;
                            format!("{} = {}", key, placeholder)
                        })
                        .collect();
                    query.push_str(" WHERE ");
                    query.push_str(&conditions.join(" AND "));
                }
            },
            SqlOperation::Insert => {
                // INSERT 操作
                let fields: Vec<String> = self.params.keys().cloned().collect();
                let placeholders: Vec<String> = (1..=self.params.len())
                    .map(|i| format!("${}", i))
                    .collect();

                query.push_str(&format!(
                    "INSERT INTO {} ({}) VALUES ({})",
                    self.table,
                    fields.join(", "),
                    placeholders.join(", ")
                ));

                // 收集参数值
                for field in fields {
                    values.push(self.params[&field].clone());
                }
            },
            SqlOperation::Update => {
                // UPDATE 操作
                query.push_str(&format!("UPDATE {}", self.table));

                let set_clauses: Vec<String> = self.params
                    .keys()
                    .map(|key| {
                        let placeholder = format!("${}", param_counter);
                        values.push(self.params[key].clone());
                        param_counter += 1;
                        format!("{} = {}", key, placeholder)
                    })
                    .collect();

                query.push_str(" SET ");
                query.push_str(&set_clauses.join(", "));

                // 添加 WHERE 条件
                if !self.where_conditions.is_empty() {
                    let conditions: Vec<String> = self.where_conditions
                        .iter()
                        .map(|(key, _)| {
                            let placeholder = format!("${}", param_counter);
                            values.push(self.where_conditions[key].clone());
                            param_counter += 1;
                            format!("{} = {}", key, placeholder)
                        })
                        .collect();
                    query.push_str(" WHERE ");
                    query.push_str(&conditions.join(" AND "));
                }
            },
            SqlOperation::Delete => {
                // DELETE 操作
                query.push_str(&format!("DELETE FROM {}", self.table));

                // 添加 WHERE 条件
                if !self.where_conditions.is_empty() {
                    let conditions: Vec<String> = self.where_conditions
                        .iter()
                        .map(|(key, _)| {
                            let placeholder = format!("${}", param_counter);
                            values.push(self.where_conditions[key].clone());
                            param_counter += 1;
                            format!("{} = {}", key, placeholder)
                        })
                        .collect();
                    query.push_str(" WHERE ");
                    query.push_str(&conditions.join(" AND "));
                }
            }
        }

        // 添加 ORDER BY
        if let Some(order) = &self.order_by {
            query.push_str(&format!(" ORDER BY {}", order));
        }

        // 添加 LIMIT
        if let Some(limit) = self.limit {
            query.push_str(&format!(" LIMIT {}", limit));
        }

        (query, values)
    }

    /** 
        设置查询字段
        @param fields 字段列表
        @return &mut Self 返回可变引用以便链式调用
    */
    pub fn fields(&mut self, fields: Vec<String>) -> &mut Self {
        self.fields = fields;
        self
    }

    /** 
        设置参数
        @param params 参数键值对
        @return &mut Self 返回可变引用以便链式调用
    */
    pub fn params(&mut self, params: HashMap<String, String>) -> &mut Self {
        self.params = params;
        self
    }

    /** 
        设置WHERE条件
        @param conditions 条件键值对
        @return &mut Self 返回可变引用以便链式调用
    */
    pub fn where_conditions(&mut self, conditions: HashMap<String, String>) -> &mut Self {
        self.where_conditions = conditions;
        self
    }

    /** 
        设置排序
        @param order 排序字段
        @return &mut Self 返回可变引用以便链式调用
    */
    pub fn order_by(&mut self, order: &str) -> &mut Self {
        self.order_by = Some(order.to_string());
        self
    }

    /** 
        设置限制
        @param limit 限制记录数
        @return &mut Self 返回可变引用以便链式调用
    */
    pub fn limit(&mut self, limit: i32) -> &mut Self {
        self.limit = Some(limit);
        self
    }
}