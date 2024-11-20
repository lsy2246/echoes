use jwt_compact::{alg::Ed25519, AlgorithmExt, Header, Token, UntrustedToken, TimeOptions};
use serde::{Serialize, Deserialize};
use chrono::{Duration, Utc};
use ed25519_dalek::{SigningKey, VerifyingKey};
use std::fs::File;
use std::io::Write;
use std::{env, fs};
use std::error::Error;
use rand::{SeedableRng, RngCore};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CustomClaims {
    pub name: String,
}

pub enum SecretKey {
    Signing,
    Verifying,
}

impl SecretKey {
    fn as_string(&self) -> String {
        match self {
            Self::Signing => String::from("signing"),
            Self::Verifying => String::from("verifying"),
        }
    }
}

pub fn generate_key() -> Result<(), Box<dyn Error>> {
    let mut csprng = rand::rngs::StdRng::from_entropy();

    let mut private_key_bytes = [0u8; 32];
    csprng.fill_bytes(&mut private_key_bytes);

    let signing_key = SigningKey::from_bytes(&private_key_bytes);
    let verifying_key = signing_key.verifying_key();

    let base_path = env::current_dir()?
        .join("assets")
        .join("key");

    fs::create_dir_all(&base_path)?;
    File::create(base_path.join(SecretKey::Signing.as_string()))?
        .write_all(signing_key.as_bytes())?;
    File::create(base_path.join(SecretKey::Verifying.as_string()))?
        .write_all(verifying_key.as_bytes())?;

    Ok(())
}

pub fn get_key(key_type: SecretKey) -> Result<[u8; 32], Box<dyn Error>> {
    let path = env::current_dir()?
        .join("assets")
        .join("key")
        .join(key_type.as_string());
    let key_bytes = fs::read(path)?;
    let mut key = [0u8; 32];
    key.copy_from_slice(&key_bytes[..32]);
    Ok(key)
}

pub fn generate_jwt(claims: CustomClaims, duration: Duration) -> Result<String, Box<dyn Error>> {
    let key_bytes = get_key(SecretKey::Signing)?;
    let signing_key = SigningKey::from_bytes(&key_bytes);

    let time_options = TimeOptions::new(
        Duration::seconds(0),
        Utc::now
    );
    let claims = jwt_compact::Claims::new(claims)
        .set_duration_and_issuance(&time_options, duration)
        .set_not_before(Utc::now());

    let header = Header::empty();

    let token = Ed25519.token(&header, &claims, &signing_key)?;

    Ok(token)
}

pub fn validate_jwt(token: &str) -> Result<CustomClaims, Box<dyn Error>> {
    let key_bytes = get_key(SecretKey::Verifying)?;
    let verifying = VerifyingKey::from_bytes(&key_bytes)?;
    let token = UntrustedToken::new(token)?;
    let token: Token<CustomClaims> = Ed25519.validator(&verifying).validate(&token)?;

    let time_options = TimeOptions::new(
        Duration::seconds(0),
        Utc::now
    );
    token.claims()
        .validate_expiration(&time_options)?
        .validate_maturity(&time_options)?;
    let claims = token.claims().custom.clone();

    Ok(claims)
}