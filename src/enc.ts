import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

export interface Enc {
  encrypt: (text: string) => string;
  decrypt: (text: string) => string;
}

export interface EncOptions {
  /** The encryption algorithm to use. Run `openssl list -cipher-algorithms` to see a list of supported algorithms. Default is `aes-256-cbc` */
  algorithm?: string;
  /** The length of the initialisation vector. AES always uses 16. Default is 16. */
  ivLength?: number;
  /** A secret to encrypt the with. You should set this if you want tokens to remain valid across servers or through restarts. AES uses a 32-bit secret. Default is a random 32-bit key using `crypto.randomBytes(32).toString("hex")` */
  secret?: string;
}

/**
 * Initialise an encryptor.
 */
const defaults: Required<EncOptions> = {
  algorithm: "aes-256-cbc",
  ivLength: 16,
  secret: randomBytes(32).toString("hex")
};

export default function(options: EncOptions = {}): Enc {
  const { algorithm, ivLength, secret } = { ...defaults, ...options };
  const key = Buffer.from(secret);

  const encrypt: Enc["encrypt"] = text => {
    const iv = randomBytes(ivLength);

    const cipher = createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return iv.toString("base64") + "." + encrypted.toString("base64");
  };

  const decrypt: Enc["decrypt"] = text => {
    const [ivHex, encryptedHex] = text.split(".");
    const iv = Buffer.from(ivHex, "base64");
    const encrypted = Buffer.from(encryptedHex, "base64");

    const decipher = createDecipheriv(algorithm, key, iv);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    return decrypted.toString();
  };

  return { encrypt, decrypt };
}