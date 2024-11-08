use serde::Deserialize;

#[derive(Deserialize)]
pub struct Config {
    pub info: Info,
    pub database: Database,
}

#[derive(Deserialize)]
pub struct Info {
    pub install: bool,
}

#[derive(Deserialize)]
pub struct Database {
    pub ilk : String,
    pub address : String,
    pub prot : u32,
    pub user : String,
    pub password : String,
    pub dbname : String,
}