use crate::common::error::{CustomErrorInto, CustomResult};
use bcrypt::{hash, verify, DEFAULT_COST};

pub fn generate_hash(s: &str) -> CustomResult<String> {
    Ok(hash(s, DEFAULT_COST)?)
}

pub fn verify_hash(s: &str, hash: &str) -> CustomResult<()> {
    verify(s, hash)?
        .then_some(())
        .ok_or_else(|| "密码无效".into_custom_error())
}
