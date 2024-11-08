mod sql;
mod config;
use rocket::{get, launch, routes, Route};
use rocket::http::{ContentType, Status};
use rocket::serde::{ Serialize};
use rocket::response::status;
use std::sync::{Arc, Mutex};
use once_cell::sync::Lazy;
use rocket::serde::json::Json;
use tokio::sync::Mutex as TokioMutex;
use tokio_postgres::types::ToSql;

// 获取数据库连接
static GLOBAL_SQL: Lazy<Arc<TokioMutex<Option<Box<dyn sql::Database >>>>>
= Lazy::new(|| Arc::new(TokioMutex::new(None)));

// 获取数据库连接
async fn initialize_sql() {
    let sql_instance = sql::loading().await;
    let mut lock = GLOBAL_SQL.lock().await;
    *lock = sql_instance;
}

// 网站初始化
#[get("/install")]
fn install() -> status::Custom<()> {
    status::Custom(Status::Ok, ())
}
// sql查询
#[derive(Serialize)]
struct SSql{
    key:String,
    value:String,
}
#[get("/sql")]
async fn ssql() -> status::Custom<Json<Vec<SSql>>> {
    let sql_instance=GLOBAL_SQL.lock().await;
    let sql =sql_instance.as_ref().unwrap();
    let query = "SELECT * FROM info";
    let params: &[&(dyn ToSql + Sync)] = &[];
    let data = sql.query(query, params).await.expect("查询数据失败");
    let mut vec = Vec::new();
    for row in data {
        let key=row.get(0);
        let value=row.get(1);
        vec.push(SSql{
            key,
            value,
        });
    }
    status::Custom(Status::Ok, Json(vec))
}



#[launch]
async fn rocket() -> _ {
    initialize_sql().await;
    rocket::build()
        .mount("/api", routes![install,ssql])
}
