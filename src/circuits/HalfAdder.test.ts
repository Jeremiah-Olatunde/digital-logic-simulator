import { test, expect } from "@jest/globals";
import { HalfAdder } from "./HalfAdder.js";


test("half adder", () => {
  const HA = new HalfAdder("HA");

  HA.setInputs(["A", 0], ["B", 0]);
  expect(HA.getOutput("S")).toBe(0);
  expect(HA.getOutput("C")).toBe(0);

  HA.setInputs(["A", 0], ["B", 1]);
  expect(HA.getOutput("S")).toBe(1);
  expect(HA.getOutput("C")).toBe(0);

  HA.setInputs(["A", 1], ["B", 0]);
  expect(HA.getOutput("S")).toBe(1);
  expect(HA.getOutput("C")).toBe(0);

  HA.setInputs(["A", 1], ["B", 1]);
  expect(HA.getOutput("S")).toBe(0);
  expect(HA.getOutput("C")).toBe(1);
});
