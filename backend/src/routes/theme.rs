use crate::utils::AppResult;
use rocket::{
    http::Status,
    post,
    response::status,
    serde::json::{Json, Value},
};

#[post("/current", format = "application/json", data = "<data>")]
pub fn theme_current(data: Json<String>) -> AppResult<status::Custom<Json<Value>>> {
    Ok(status::Custom(Status::Ok, Json(Value::Object(()))))
}
