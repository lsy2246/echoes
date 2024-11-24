use crate::error::CustomErrorInto;
use crate::error::CustomResult;
use bcrypt::{hash, verify, DEFAULT_COST};

pub fn generate_hash(s: &str) -> CustomResult<String> {
    let hashed = hash(s, DEFAULT_COST)?;
    Ok(hashed)
}

pub fn verify_hash(s: &str, hash: &str) -> CustomResult<()> {
    let is_valid = verify(s, hash)?;
    if !is_valid {
        return Err("密码无效".into_custom_error());
    }
    Ok(())
}
