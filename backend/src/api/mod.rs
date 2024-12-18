pub mod auth;
pub mod fields;
pub mod page;
pub mod post;
pub mod setup;
pub mod users;

use rocket::request::{FromRequest, Outcome, Request};
use rocket::routes;
use crate::api::users::Role;
use rocket::http::Status;
use crate::security::jwt;

pub struct Token(String);

#[rocket::async_trait]
impl<'r> FromRequest<'r> for Token {
    type Error = ();

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let token = request
            .headers()
            .get_one("Authorization")
            .map(|value| value.replace("Bearer ", ""));

        match token {
            Some(token) => Outcome::Success(Token(token)),
            None => Outcome::Success(Token("".to_string())),
        }
    }
}


pub struct SystemToken(String);

#[rocket::async_trait]
impl<'r> FromRequest<'r> for SystemToken {
    type Error = ();
    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let token = request
            .headers()
            .get_one("Authorization")
            .map(|value| value.replace("Bearer ", ""));
        match token.and_then(|t| jwt::validate_jwt(&t).ok()) {
            Some(claims) if claims.name == "system" => Outcome::Success(SystemToken(claims.name)),
            _ => Outcome::Error((Status::Unauthorized, ())),
        }
    }
}


pub fn jwt_routes() -> Vec<rocket::Route> {
    routes![auth::token::token_system]
}

pub fn fields_routes() -> Vec<rocket::Route> {
    routes![]
}
