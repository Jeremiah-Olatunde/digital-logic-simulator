import { test, expect } from "@jest/globals";
import { FullAdder } from "./FullAdder.js";


test("full adder", () => {
  const FA = new FullAdder("FA");

  FA.setInputs(["A", 0], ["B", 0], ["Cin", 0]);
  expect(FA.getOutput("S")).toBe(0);
  expect(FA.getOutput("Cout")).toBe(0);

  FA.setInputs(["A", 0], ["B", 0], ["Cin", 1]);
  expect(FA.getOutput("S")).toBe(1);
  expect(FA.getOutput("Cout")).toBe(0);

  FA.setInputs(["A", 0], ["B", 1], ["Cin", 0]);
  expect(FA.getOutput("S")).toBe(1);
  expect(FA.getOutput("Cout")).toBe(0);

  FA.setInputs(["A", 0], ["B", 1], ["Cin", 1]);
  expect(FA.getOutput("S")).toBe(0);
  expect(FA.getOutput("Cout")).toBe(1);

  FA.setInputs(["A", 1], ["B", 0], ["Cin", 0]);
  expect(FA.getOutput("S")).toBe(1);
  expect(FA.getOutput("Cout")).toBe(0);

  FA.setInputs(["A", 1], ["B", 0], ["Cin", 1]);
  expect(FA.getOutput("S")).toBe(0);
  expect(FA.getOutput("Cout")).toBe(1);

  FA.setInputs(["A", 1], ["B", 1], ["Cin", 0]);
  expect(FA.getOutput("S")).toBe(0);
  expect(FA.getOutput("Cout")).toBe(1);

  FA.setInputs(["A", 1], ["B", 1], ["Cin", 1]);
  expect(FA.getOutput("S")).toBe(1);
  expect(FA.getOutput("Cout")).toBe(1);
});
