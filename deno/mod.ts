import { Enc as Wasm } from "./_wasm.js";

interface Decoded<Sub> {
  nbf: number;
  exp: number;
  sub: Sub;
}

const enc = new TextEncoder();
const nowInSecs = () => Math.floor(Date.now() / 1_000);

export class Mwt<T> {
  #wasm: Wasm;
  #expiry: number;
  #leeway: number;

  constructor(secret: string | Uint8Array, expiry = 3600, leeway = 0) {
    const buffer = secret instanceof Uint8Array ? secret : enc.encode(secret);
    this.#wasm = new Wasm(buffer);
    this.#expiry = expiry;
    this.#leeway = leeway;
  }

  /** Encode a token for `sub` */
  encode(sub: T): string {
    const now = nowInSecs();
    const data: Decoded<T> = {
      sub,
      nbf: now,
      exp: now + this.#expiry,
    };
    return this.#wasm.encrypt(JSON.stringify(data));
  }

  /** Decode a token and return the `sub` if token is valid */
  decode(token: string): T {
    const data: Decoded<T> = JSON.parse(this.#wasm.decrypt(token));
    const now = nowInSecs();
    if (typeof data.exp !== "number" || typeof data.nbf !== "number") {
      throw new Error("Token is not valid.");
    }
    if ((now + this.#leeway) < data.nbf) {
      throw new Error("Token is not valid yet.");
    }
    if ((now - this.#leeway) > data.exp) {
      throw new Error("Token is not valid anymore.");
    }
    return data.sub;
  }
}
