use async_trait::async_trait;
use sqlx::{PgPool, Row,Column};
use std::{collections::HashMap, error::Error};
use super::Databasetrait;

#[derive(Clone)]
pub struct Postgresql {
    pool: PgPool,
}



#[async_trait]
impl Databasetrait for Postgresql {
    async fn connect(
        address: String,
        port: u32,
        user: String,
        password: String,
        dbname: String,
    ) -> Result<Self, Box<dyn Error>> {
        let connection_str = format!(
            "postgres://{}:{}@{}:{}/{}",
            user, password, address, port, dbname
        );

        let pool = PgPool::connect(&connection_str)
            .await
            .map_err(|e| Box::new(e) as Box<dyn Error>)?;

        Ok(Postgresql { pool })
    }
    async fn query<'a>(&'a self, query: String) -> Result<Vec<HashMap<String, String>>, Box<dyn Error + 'a>> {
        let rows = sqlx::query(&query)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| Box::new(e) as Box<dyn Error>)?;

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