pub mod auth;
pub mod configure;
pub mod install;
pub mod person;
use rocket::http::Status;
use rocket::request::{FromRequest, Outcome, Request};
use rocket::routes;

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

        match token {
            Some(token) => {
                if token == "system" {
                    Outcome::Success(SystemToken(token))
                } else {
                    Outcome::Error((Status::Unauthorized, ()))
                }
            }
            None => Outcome::Error((Status::Unauthorized, ())),
        }
    }
}

pub fn jwt_routes() -> Vec<rocket::Route> {
    routes![auth::token::token_system]
}
