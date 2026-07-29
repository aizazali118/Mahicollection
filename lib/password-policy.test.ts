import assert from "node:assert/strict";
import test from "node:test";
import { isStrongPassword } from "./password-policy";

test("accepts strong passwords and rejects weak ones", () => {
  assert.equal(isStrongPassword("Abcdef1!"), true);
  assert.equal(isStrongPassword("abcdefg1!"), false);
  assert.equal(isStrongPassword("ABCDEFG1!"), false);
  assert.equal(isStrongPassword("Abcdefgh!"), false);
  assert.equal(isStrongPassword("Abcdefg12"), false);
});
