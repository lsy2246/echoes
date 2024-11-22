use crate::auth;
use crate::{AppResult, AppState};
use chrono::Duration;
use rocket::{get, http::Status, response::status, State};

#[get("/system")]
pub async fn token_system(_state: &State<AppState>) -> AppResult<status::Custom<String>> {
    let claims = auth::jwt::CustomClaims {
        name: "system".into(),
    };

    auth::jwt::generate_jwt(claims, Duration::seconds(1))
        .map(|token| status::Custom(Status::Ok, token))
        .map_err(|e| status::Custom(Status::InternalServerError, e.to_string()))
}
