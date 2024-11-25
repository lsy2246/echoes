use crate::error::CustomResult;
use chrono::{Duration, Utc};
use ed25519_dalek::{SigningKey, VerifyingKey};
use jwt_compact::{alg::Ed25519, AlgorithmExt, Header, TimeOptions, Token, UntrustedToken};
use rand::{RngCore, SeedableRng};
use serde::{Deserialize, Serialize};
use std::{env, fs, path::PathBuf};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CustomClaims {
    pub name: String,
}

pub enum SecretKey {
    Signing,
    Verifying,
}

impl SecretKey {
    const fn as_str(&self) -> &'static str {
        match self {
            Self::Signing => "signing",
            Self::Verifying => "verifying",
        }
    }
}

fn get_key_path(key_type: &SecretKey) -> CustomResult<PathBuf> {
    Ok(env::current_dir()?
        .join("assets")
        .join("key")
        .join(key_type.as_str()))
}

pub fn generate_key() -> CustomResult<()> {
    let mut csprng = rand::rngs::StdRng::from_entropy();
    let mut private_key_bytes = [0u8; 32];
    csprng.fill_bytes(&mut private_key_bytes);

    let signing_key = SigningKey::from_bytes(&private_key_bytes);
    let verifying_key = signing_key.verifying_key();

    let base_path = get_key_path(&SecretKey::Signing)?
        .parent()
        .unwrap()
        .to_path_buf();
    fs::create_dir_all(&base_path)?;

    fs::write(get_key_path(&SecretKey::Signing)?, signing_key.as_bytes())?;
    fs::write(
        get_key_path(&SecretKey::Verifying)?,
        verifying_key.as_bytes(),
    )?;

    Ok(())
}

pub fn get_key(key_type: SecretKey) -> CustomResult<[u8; 32]> {
    let key_bytes = fs::read(get_key_path(&key_type)?)?;
    let mut key = [0u8; 32];
    key.copy_from_slice(&key_bytes[..32]);
    Ok(key)
}

pub fn generate_jwt(claims: CustomClaims, duration: Duration) -> CustomResult<String> {
    let signing_key = SigningKey::from_bytes(&get_key(SecretKey::Signing)?);
    let time_options = TimeOptions::new(Duration::seconds(0), Utc::now);

    let claims = jwt_compact::Claims::new(claims)
        .set_duration_and_issuance(&time_options, duration)
        .set_not_before(Utc::now());

    Ok(Ed25519.token(&Header::empty(), &claims, &signing_key)?)
}

pub fn validate_jwt(token: &str) -> CustomResult<CustomClaims> {
    let verifying = VerifyingKey::from_bytes(&get_key(SecretKey::Verifying)?)?;
    let time_options = TimeOptions::new(Duration::seconds(0), Utc::now);

    let token: Token<CustomClaims> = Ed25519
        .validator(&verifying)
        .validate(&UntrustedToken::new(token)?)?;

    token
        .claims()
        .validate_expiration(&time_options)?
        .validate_maturity(&time_options)?;

    Ok(token.claims().custom.clone())
}
