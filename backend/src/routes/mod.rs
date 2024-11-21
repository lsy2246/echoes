pub mod intsall;
pub mod person;
use rocket::routes; 

pub fn create_routes() -> Vec<rocket::Route> {
    routes![
        intsall::install,
    ]
}

