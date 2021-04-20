use orion::aead;

#[derive(Debug)]
pub enum Error {
    ConvertError,
    DecodeError,
    CryptoError,
    SecretError,
}

impl Error {
    pub fn to_string(&self) -> String {
        format!("{:?}", self)
    }
}

impl From<base64::DecodeError> for Error {
    fn from(_: base64::DecodeError) -> Self {
        Error::DecodeError
    }
}

impl From<orion::errors::UnknownCryptoError> for Error {
    fn from(_: orion::errors::UnknownCryptoError) -> Self {
        Error::CryptoError
    }
}

impl From<std::string::FromUtf8Error> for Error {
    fn from(_: std::string::FromUtf8Error) -> Self {
        Error::ConvertError
    }
}

pub use aead::SecretKey;

/// Encrypt text
pub fn encrypt(secret: &aead::SecretKey, text: &str) -> Result<String, Error> {
    let text = text.as_bytes();
    let text = aead::seal(secret, text)?;
    let text = base64::encode(text);
    Ok(text)
}

/// Decrypt text
pub fn decrypt(secret: &aead::SecretKey, text: &str) -> Result<String, Error> {
    let text = base64::decode(text)?;
    let text = aead::open(secret, &text)?;
    let text = String::from_utf8(text)?;
    Ok(text)
}
