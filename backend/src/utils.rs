use rand::seq::SliceRandom;


pub fn generate_random_string(length: usize) -> String {
    let charset = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let mut rng = rand::thread_rng();
    (0..length)
        .map(|_| *charset.choose(&mut rng).unwrap() as char)
        .collect()
}

pub struct CustomError(String);

impl std::fmt::Display for CustomError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}


impl<T> From<T> for CustomError
where
    T: std::error::Error + Send + 'static,
{
    fn from(error: T) -> Self {
        CustomError(error.to_string())
    }
}

impl CustomError {
    pub fn from_str(error: &str) -> Self {
        CustomError(error.to_string())
    }
}
