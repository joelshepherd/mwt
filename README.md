# mwt - Mini (JSON) Web Tokens

JWT, without the bloat.

`mwt` is a simplified JWT(ish) module for use-cases which do not require unsecure or third-party services to verify its tokens.

- Strips all "about this token" claims
- Encrypts symmetrically instead of asymmetrically

## Usage

```ts
import mwt from "mwt";

const encoder = mwt();

// Create an opaque stateless token
const token = encoder.encodeToken("some-user-id");

// Check the token's validity in future requests
try {
  const userId = encoder.decodeToken(token);
} catch (err) {
  // Token is not valid
}
```

## Simple Encryptor

`mwt` also comes with a simple wrapper around Node's crypto library that it uses to encrypt the tokens.

```ts
import { enc } from "mwt";

const { encrypt, decrypt } = enc();

const encrypted = encrypt("Some secret text");
const decrypted = decrypt(encrypted);

assert.equal(decrypted, "Some secret text");
```
