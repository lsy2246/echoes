use serde::{Deserialize,Serialize};
use crate::{config,utils};
use crate::database::{relational,relational::builder};
use crate::{AppState,AppError,AppResult};
use rocket::{
    get, post,
    http::Status,
    response::status,
    serde::json::Json,
    State,
};
use std::collections::HashMap;


#[derive(Deserialize, Serialize)]
struct InstallData{
    name:String,
    email:String,
    password:String,
    sql_config: config::SqlConfig

}
#[derive(Deserialize, Serialize)]
struct InstallReplyData{
    token:String,
    name:String,
    password:String,
}


#[post("/install", format = "application/json", data = "<data>")]
async fn install(
    data: Json<InstallData>,
    state: &State<AppState>
) -> AppResult<status::Custom<Json<InstallReplyData>>, AppError> {
    let mut config = state.configure.lock().await;
    if config.info.install {
        return Err(AppError::Database("Database already initialized".to_string()));
    }

    let data=data.into_inner();

    relational::Database::initial_setup(data.sql_config.clone())
        .await
        .map_err(|e| AppError::Database(e.to_string()))?;

    config.info.install = true;

    state.link_sql(data.sql_config.clone());
    let sql= state.get_sql()
        .await?
        .get_db();


    let system_name=utils::generate_random_string(20);
    let system_password=utils::generate_random_string(20);

    let mut builder = builder::QueryBuilder::new(builder::SqlOperation::Insert,String::from("persons"))?;

    let user_params=HashMap::new();
    user_params.insert("person_name", data.name);
    user_params.insert("person_email", data.email);
    user_params.insert("person_password", data.password);
    user_params.insert("person_role", data.name);



    config::Config::write(config.clone())
        .map_err(|e| AppError::Config(e.to_string()))?; 
    Ok()
}