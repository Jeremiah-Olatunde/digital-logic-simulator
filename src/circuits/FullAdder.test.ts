import { test, expect } from "@jest/globals";
import { FullAdder, XBitFullAdder } from "./FullAdder.js";


test("1 bit full adder", () => {
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

test("X bit full adder", () => {
  const FA = new XBitFullAdder("16bit", 16);
  for(let i = 0; i < 10; i++){
    const A = (~~(Math.random() * (2 ** 16))).toString(2).padStart(16, "0");
    const B = (~~(Math.random() * (2 ** 16))).toString(2).padStart(16, "0");
    const sum = FA.add(A, B);
    const sumWithCarry = FA.getOutput("Cout").toString() + sum;
    expect(parseInt(A, 2) + parseInt(B, 2)).toBe(parseInt(sumWithCarry, 2));
  }
})

