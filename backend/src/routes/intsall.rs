use serde::{Deserialize,Serialize};
use crate::{config,utils};
use crate::database::relational;
use crate::{AppState,AppError,AppResult};
use rocket::{
    post,
    http::Status,
    response::status,
    serde::json::Json,
    State,
};
use crate::routes::person;
use crate::auth;
use chrono::Duration;


#[derive(Deserialize, Serialize)]
pub struct InstallData{
    name:String,
    email:String,
    password:String,
    sql_config: config::SqlConfig
}
#[derive(Deserialize, Serialize)]
pub struct InstallReplyData{
    token:String,
    name:String,
    password:String,
}

#[post("/test", format = "application/json", data = "<data>")]
pub async fn test(
    data: Json<InstallData>,
    state: &State<AppState>
) -> Result<status::Custom<String>, status::Custom<String>> {
    let data=data.into_inner();


    let sql= state.get_sql().await.map_err(|e| e)?;

    let _ = person::insert(&sql,person::RegisterData{ name: data.name.clone(), email: data.email, password:data.password });
    Ok(status::Custom(Status::Ok, "Installation successful".to_string()))

}

#[post("/install", format = "application/json", data = "<data>")]
pub async fn install(
    data: Json<InstallData>,
    state: &State<AppState>
) -> Result<status::Custom<Json<InstallReplyData>>, status::Custom<String>> {
    let mut config = state.configure.lock().await;
    if config.info.install {
        return Err(status::Custom(Status::BadRequest, "Database already initialized".to_string()));
    }

    let data=data.into_inner();

    relational::Database::initial_setup(data.sql_config.clone())
        .await
        .map_err(|e| status::Custom(Status::InternalServerError, e.to_string()))?;

    config.info.install = true;

    state.link_sql(data.sql_config.clone()).await?;
    let sql= state.get_sql().await?;


    let system_name=utils::generate_random_string(20);
    let system_password=utils::generate_random_string(20);

    let _ = person::insert(&sql,person::RegisterData{ name: data.name.clone(), email: data.email, password:data.password }).await?;
    let _ = person::insert(&sql,person::RegisterData{ name: system_name.clone(), email: String::from("author@lsy22.com"), password:system_name.clone() }).await?;
    let token = auth::jwt::generate_jwt(
        auth::jwt::CustomClaims{name:data.name.clone()},
        Duration::days(7)
    ).map_err(|e| status::Custom(Status::Unauthorized, e.to_string()))?;



    config::Config::write(config.clone())
        .map_err(|e| status::Custom(Status::InternalServerError, e.to_string()))?; 
    Ok(
        status::Custom(
            Status::Ok,
            Json(InstallReplyData{
                token:token,
                name: system_name,
                password: system_password
            }
        )
    )
    )
}