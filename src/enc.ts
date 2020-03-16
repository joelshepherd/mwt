import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

export interface Enc {
  /**
   * Encrypt the text.
   */
  encrypt: (text: string) => string;
  /**
   * Decrypt the text.
   */
  decrypt: (text: string) => string;
}

export interface EncOptions {
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

/**
 * Initialise an encryptor.
 */
export default function(options: EncOptions = {}): Enc {
  const { algorithm, ivLength, secret } = {
    algorithm: "aes-256-cbc",
    ivLength: 16,
    secret: randomBytes(32),
    ...options
  };
  const key = secret instanceof Buffer ? secret : Buffer.from(secret);

  const encrypt: Enc["encrypt"] = text => {
    const iv = randomBytes(ivLength);

    const cipher = createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return iv.toString("base64") + "." + encrypted.toString("base64");
  };

  const decrypt: Enc["decrypt"] = text => {
    const [encodedIv, encoded] = text.split(".");
    const iv = Buffer.from(encodedIv, "base64");
    const encrypted = Buffer.from(encoded, "base64");

    const decipher = createDecipheriv(algorithm, key, iv);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    return decrypted.toString();
  };

  return { encrypt, decrypt };
}
