# mwt - Mini (JSON) Web Tokens

JWT, without the bloat.

`mwt` is an tiny JWT(ish) module that follows the 80-20 rule. It keeps the 20% of JWT that covers 80% of the use-cases.

It covers applications that control their own authorisation tokens, and do not need them to be readable by an insecure or third-party host.

- Stateless authorisation
- Wholly encrypted tokens
- Tiny token sizes (50-90% smaller than JWT)
- Zero dependencies

## Usage

```ts
import mwt from "mwt";

const { encodeToken, decodeToken } = mwt();

// Create an opaque, stateless token
const token = encodeToken("some-user-id");

// Check the token's validity in future requests
try {
  const userId = decodeToken(token);
} catch (err) {
  // Token is not valid
}
```

## Options

```ts
interface MwtOptions {
  /**
   * The length of time (in seconds) that a token is valid for.
   * Default is 1 hour.
   */
  expiry?: number;
  /**
   * The length of time (in seconds) that a token can be accepted before or after it is valid.
   * This can be used to account for clock drift, although should not be needed unless you have multiple servers.
   * Default is 0.
   */
  leeway?: number;
}

interface EncOptions {
  /**
   * The encryption algorithm to use.
   * Run `openssl list -cipher-algorithms` to see a list of supported algorithms.
   * Default is `aes-256-cbc`
   */
  algorithm?: string;
  /**
   * The length in bytes of the initialisation vector.
   * AES uses 16.
   * Default is 16.
   */
  ivLength?: number;
  /**
   * A secret to encrypt the tokens.
   * You should set this if you want tokens to be valid across multiple servers, or through server restarts.
   * `aes-256-*` uses a 32 byte (256-bit) secret.
   * Default is 32 random bytes using `crypto.randomBytes(32)`
   */
  secret?: string | Buffer;
}

type Options = MwtOptions & EncOptions;
```

## Simple Encryptor

`mwt` also comes with a simple wrapper around Node's crypto library that it uses to encrypt the tokens. You can use it too!

```ts
import { enc } from "mwt";

const { encrypt, decrypt } = enc();

const input = "Some secret text";
const encrypted = encrypt(input);
const decrypted = decrypt(encrypted);

assert.equal(decrypted, input);
```
