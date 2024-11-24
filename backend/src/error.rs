use rocket::http::Status;
use rocket::response::status;

pub type AppResult<T> = Result<T, status::Custom<String>>;

pub trait AppResultInto<T> {
    fn into_app_result(self) -> AppResult<T>;
}

#[derive(Debug)]
pub struct CustomError(String);

impl std::fmt::Display for CustomError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

pub trait CustomErrorInto {
    fn into_custom_error(self) -> CustomError;
}

impl CustomErrorInto for &str {
    fn into_custom_error(self) -> CustomError {
        CustomError(self.to_string())
    }
}

impl<E: std::error::Error> From<E> for CustomError {
    fn from(error: E) -> Self {
        CustomError(error.to_string())
    }
}

pub type CustomResult<T> = Result<T, CustomError>;

impl<T> AppResultInto<T> for CustomResult<T> {
    fn into_app_result(self) -> AppResult<T> {
        self.map_err(|e| status::Custom(Status::InternalServerError, e.to_string()))
    }
}
