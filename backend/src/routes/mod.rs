pub mod auth;
pub mod intsall;
pub mod person;
pub mod theme;
use rocket::routes;

pub fn jwt_routes() -> Vec<rocket::Route> {
    routes![auth::token::token_system]
}
