use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Enc {
    secret: native::SecretKey,
}

#[wasm_bindgen]
impl Enc {
    #[wasm_bindgen(constructor)]
    pub fn new(secret: &[u8]) -> Result<Enc, JsValue> {
        let secret = native::SecretKey::from_slice(secret)
            .map_err(|_| JsValue::from_str("Secret is not valid."))?;

        Ok(Self { secret })
    }

    /// Encrypt text
    pub fn encrypt(&self, text: &str) -> Result<String, JsValue> {
        native::encrypt(&self.secret, text).map_err(|e| JsValue::from_str(&e.to_string()))
    }

    /// Decrypt text
    pub fn decrypt(&self, text: &str) -> Result<String, JsValue> {
        native::decrypt(&self.secret, text).map_err(|e| JsValue::from_str(&e.to_string()))
    }
}
