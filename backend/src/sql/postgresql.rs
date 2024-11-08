use tokio_postgres::{NoTls, Error, Row, Client, Connection, Socket};
use crate::sql;
use async_trait::async_trait;
use tokio_postgres::tls::NoTlsStream;

pub struct Postgresql {
    pub client: tokio_postgres::Client,
}

pub async fn connect(
    address: String,
    port: u32,
    user: String,
    password: String,
    dbname: String,
) -> Result<Postgresql, Error> {
    let connection_str = format!(
        "host={} port={} user={} password={} dbname={}",
        address, port, user, password, dbname
    );

    let client:Client;
    let connection:Connection<Socket, NoTlsStream>;
    let link = tokio_postgres::connect(&connection_str, NoTls).await;
    match link {
        Ok((clie,conne)) => {
            client = clie;
            connection = conne;
        }
        Err(err) => {
            println!("Failed to connect to postgresql: {}", err);
            return Err(err);
        }
    }

    tokio::spawn(async move {
        if let Err(e) = connection.await {
            eprintln!("postgresql connection error: {}", e);
        }
    });

    Ok(Postgresql { client })
}

impl Postgresql {

}
#[async_trait]
impl sql::Database for Postgresql {
    async fn query(&self, query: & str,
                       params: &[&(dyn tokio_postgres::types::ToSql + Sync)]
    ) -> Result<Vec<Row>, Error> {
        let rows = self.client.query(query, params).await?;
        Ok(rows)
    }

    async fn execute(
        &self,
        data: &str,
        params: &[&(dyn tokio_postgres::types::ToSql + Sync)],
    ) -> Result<u64, Error> {
        let rows_affected = self.client.execute(data, params).await?;
        Ok(rows_affected)
    }
}
