import mwt from "./mwt";
import { expect } from "chai";

describe("mwt()", function() {
  it("should decode to the same input as the encode", function() {
    const m = mwt<string>();
    const token = m.encodeToken("test-user-id");
    expect(m.decodeToken(token)).to.equal("test-user-id");
  });

  it("should accept a number as the subject", function() {
    const m = mwt<number>();
    const token = m.encodeToken(1234);
    expect(m.decodeToken(token)).to.equal(1234);
  });

  it("should accept a string as the subject", function() {
    const m = mwt<string>();
    const token = m.encodeToken("some-string");
    expect(m.decodeToken(token)).to.equal("some-string");
  });

  it("should accept an object as the subject", function() {
    const m = mwt<{ id: number }>();
    const token = m.encodeToken({ id: 123 });
    expect(m.decodeToken(token)).to.deep.equal({ id: 123 });
  });
});
