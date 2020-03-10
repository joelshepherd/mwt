import enc, { EncOptions } from "./enc";

interface Decoded<Sub> {
  nbf: number;
  exp: number;
  sub: Sub;
}

export interface MwtOptions {
  /** The length of time (in seconds) that a token is valid for. Default is 1 hour. */
  expiry?: number;
  /** The length of time (in seconds) that a token can be accepted after expiring. Default is 0. */
  leeway?: number;
}

export type Options = MwtOptions & EncOptions;

const defaults: Required<MwtOptions> = {
  expiry: 3600,
  leeway: 0
};

/**
 * Initialise a token encoder/decoder.
 */
export default function<Sub = unknown>(options: Options = {}) {
  const { leeway, expiry, ...encOptions } = { ...defaults, ...options };
  const { decrypt, encrypt } = enc(encOptions);

  /**
   * Encode a user (id) into a token.
   * @param sub A subject (user) - must be JSON.strigify-able
   */
  const encodeToken = (sub: Sub): string => {
    const now = Math.floor(Date.now() / 1000);
    const data: Decoded<Sub> = {
      sub,
      nbf: now,
      exp: now + expiry
    };

    return encrypt(JSON.stringify(data));
  };

  /**
   * Decode a user (id) token.
   * @param token An encoded token
   */
  const decodeToken = (token: string): Sub => {
    const data: Decoded<Sub> = JSON.parse(decrypt(token));

    if (typeof data.exp !== "number" || typeof data.nbf !== "number") {
      throw new Error("Token is not valid.");
    }

    const now = Math.floor(Date.now() / 1000);
    if (now + leeway < data.nbf) {
      throw new Error("Token is not valid yet.");
    }
    if (now - leeway > data.exp) {
      throw new Error("Token is not valid anymore.");
    }

    return data.sub;
  };

  return { encodeToken, decodeToken };
}
