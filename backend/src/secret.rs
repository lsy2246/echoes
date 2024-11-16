// File path: src/secret.rs

/**
 * 本文件包含JWT的生成和验证功能。
 * 提供了生成密钥、生成JWT、验证JWT的相关函数。
 */

use jwt_compact::{alg::Ed25519, AlgorithmExt, Header, Token, UntrustedToken, TimeOptions};
use serde::{Serialize, Deserialize};
use chrono::{Duration, Utc};
use ed25519_dalek::{SigningKey, VerifyingKey};
use std::fs::File;
use std::io::Write;
use std::{env, fs};
use std::error::Error;
use rand::{SeedableRng, RngCore};

// 定义JWT的Claims结构体（有效载荷）
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CustomClaims {
    pub user_id: String,  // 用户ID
    pub device_ua: String,  // 用户UA
}

pub enum SecretKey {
    Signing,  // 签名密钥
    Verifying,  // 验证密钥
}

impl SecretKey {
    fn as_string(&self) -> String {
        match self {
            Self::Signing => String::from("signing"),
            Self::Verifying => String::from("verifying"),
        }
    }
}

/**
 * 生成签名密钥和验证密钥，并将其保存到文件中。
 */
pub fn generate_key() -> Result<(), Box<dyn Error>> {
    let mut csprng = rand::rngs::StdRng::from_entropy();  // 使用系统熵创建随机数生成器

    let mut private_key_bytes = [0u8; 32];  // 存储签名密钥的字节数组
    csprng.fill_bytes(&mut private_key_bytes);  // 生成签名密钥

    let signing_key = SigningKey::from_bytes(&private_key_bytes);  // 从签名密钥获取SigningKey
    let verifying_key = signing_key.verifying_key();  // 获取验证密钥

    let base_path = env::current_dir()?
        .join("assets")
        .join("key");

    fs::create_dir_all(&base_path)?;  // 创建目录
    File::create(base_path.join(SecretKey::Signing.as_string()))?
        .write_all(signing_key.as_bytes())?;  // 保存签名密钥
    File::create(base_path.join(SecretKey::Verifying.as_string()))?
        .write_all(verifying_key.as_bytes())?;  // 保存验证密钥

    Ok(())
}

/**
 * 从文件中读取指定类型的密钥。
 */
pub fn get_key(key_type: SecretKey) -> Result<[u8; 32], Box<dyn Error>> {
    let path = env::current_dir()?
        .join("assets")
        .join("key")
        .join(key_type.as_string());
    let key_bytes = fs::read(path)?;  // 读取密钥文件
    let mut key = [0u8; 32];  // 固定长度的数组
    key.copy_from_slice(&key_bytes[..32]);  // 拷贝前32个字节
    Ok(key)
}

/**
 * 生成JWT，包含自定义声明和有效期。
 */
pub fn generate_jwt(claims: CustomClaims, duration: Duration) -> Result<String, Box<dyn Error>> {
    let key_bytes = get_key(SecretKey::Signing)?;  // 从文件读取私钥
    let signing_key = SigningKey::from_bytes(&key_bytes);  // 创建SigningKey

    let time_options = TimeOptions::new(
        Duration::seconds(0),  // 设置时间容差为0
        Utc::now  // 使用当前UTC时间作为时钟函数
    ); // 设置时间容差为);  // 默认时间选项
    let claims = jwt_compact::Claims::new(claims)  // 创建JWT的有效载荷
        .set_duration_and_issuance(&time_options, duration)
        .set_not_before(Utc::now());  // 设置不早于时间

    let header = Header::empty();  // 创建自定义的头部

    let token = Ed25519.token(&header, &claims, &signing_key)?;  // 使用Ed25519签名JWT

    Ok(token)
}

/**
 * 验证JWT并返回自定义声明。
 */
pub fn validate_jwt(token: &str) -> Result<CustomClaims, Box<dyn Error>> {
    let key_bytes = get_key(SecretKey::Verifying)?;  // 从文件读取验证密钥
    let verifying = VerifyingKey::from_bytes(&key_bytes)?;  // 创建VerifyingKey
    let token = UntrustedToken::new(token)?;  // 创建未受信任的Token
    let token: Token<CustomClaims> = Ed25519.validator(&verifying).validate(&token)?;  // 验证Token

    let time_options = TimeOptions::new(
        Duration::seconds(0),  // 设置时间容差为0
        Utc::now  // 使用当前UTC时间作为时钟函数
    ); // 设置时间容差为);  // 默认时间选项
    token.claims()
        .validate_expiration(&time_options)?  // 验证过期时间
        .validate_maturity(&time_options)?;  // 验证成熟时间
    let claims = token.claims().custom.clone();  // 获取自定义声明

    Ok(claims)
}