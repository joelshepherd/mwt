//! Test suite for the Web and headless browsers.

#![cfg(target_arch = "wasm32")]

extern crate wasm_bindgen_test;
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]

fn test_basic() {
    let secret = "12345678901234567890123456789012".as_bytes();
    let enc = wasm::Enc::new(secret).unwrap();

    let plain = "Test string";

    let encrypted = enc.encrypt(&plain).unwrap();
    assert!(plain != encrypted);

    let decrypted = enc.decrypt(&encrypted).unwrap();
    assert!(encrypted != decrypted);
    assert!(plain == decrypted);
}
