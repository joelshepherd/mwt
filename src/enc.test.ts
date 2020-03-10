import { expect } from "chai";
import enc from "./enc";

describe("enc()", function() {
  it("should encrypt to unreadable text", function() {
    const { encrypt } = enc();
    const encrypted = encrypt("hello world!");
    expect(encrypted).to.not.contain("hello world!");
  });

  it("should decrypt to plain text", function() {
    const { decrypt } = enc({
      secret: "5ae88b78e84cae977468d34cf943cc97"
    });
    const plain = decrypt("yKOwTDbC0M/9+frPmh43hA==.JC7QmOTmyOv0td4HhOhsYw==");
    expect(plain).to.equal("secret message");
  });

  it("should decrypt to the same input as the encrypt", function() {
    const { encrypt, decrypt } = enc();
    const input = "A fun sentence.";
    const encrypted = encrypt(input);
    const decrypted = decrypt(encrypted);
    expect(decrypted).to.equal(input);
  });
});
