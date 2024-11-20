mod intsall;
use rocket::routes;

pub fn create_routes() -> routes {
    routes!["/", intsall::install]
}