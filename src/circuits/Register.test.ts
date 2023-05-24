import { test, expect } from "@jest/globals";
import { PIPO } from "./Register.js";

test("4 bit Parallel in parallel out register", () => {
  const register = new PIPO("PIP0", 4);

  register.write("1010");
  expect(register.read()).toBe("1010");

  register.clear();
  expect(register.read()).toBe("0000");

  register.write("0101");
  expect(register.read()).toBe("0101");

  register.write("1111");
  expect(register.read()).toBe("1111");
})