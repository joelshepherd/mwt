import enc, { EncOptions } from "./enc";

export interface Mwt<Sub> {
  /**
   * Encode a user into a token.
   * @param sub A subject (user), must be JSON stringify-able
   */
  encodeToken(sub: Sub): string;
  /**
   * Decode a user from a token.
   * @param token An encoded token
   */
  decodeToken(token: string): Sub;
}

export interface MwtOptions {
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

export type Options = MwtOptions & EncOptions;

interface Decoded<Sub> {
  nbf: number;
  exp: number;
  sub: Sub;
}

/**
 * Initialise a token encoder/decoder.
 */
export default function<Sub = unknown>(options: Options = {}): Mwt<Sub> {
  const { leeway, expiry, ...encOptions } = {
    expiry: 3600,
    leeway: 0,
    ...options
  };
  const { decrypt, encrypt } = enc(encOptions);

  const encodeToken: Mwt<Sub>["encodeToken"] = sub => {
    const now = getNow();
    const data: Decoded<Sub> = {
      sub,
      nbf: now,
      exp: now + expiry
    };

    return encrypt(JSON.stringify(data));
  };

  const decodeToken: Mwt<Sub>["decodeToken"] = token => {
    const data: Decoded<Sub> = JSON.parse(decrypt(token));

    if (typeof data.exp !== "number" || typeof data.nbf !== "number") {
      throw new Error("Token is not valid.");
    }

    const now = getNow();
    if (now + leeway < data.nbf) {
      throw new Error("Token is not valid yet.");
    }
    if (now - leeway > data.exp) {
      throw new Error("Token is not valid anymore.");
    }

    return data.sub;
  };

  return { decodeToken, encodeToken };
}

function getNow() {
  return Math.floor(Date.now() / 1000);
}
