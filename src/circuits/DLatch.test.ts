import { test, expect } from "@jest/globals";
import { DLatch } from "./DLatch.js";

test("Asynchronous D Latch with active low preset and clear", () => {
  const latch = new DLatch("D");

  expect(latch.getOutput("Q")).toBe(0);
  expect(latch.getOutput("!Q")).toBe(1);

  latch.setInput("D", 0);

  expect(latch.getOutput("Q")).toBe(0);
  expect(latch.getOutput("!Q")).toBe(1);

  latch.setInput("D", 1);
  latch.setInput("EN", 1);
  latch.setInput("EN", 0);

  expect(latch.getOutput("Q")).toBe(1);
  expect(latch.getOutput("!Q")).toBe(0);

  latch.setInput("D", 0);

  expect(latch.getOutput("Q")).toBe(1);
  expect(latch.getOutput("!Q")).toBe(0); 

  latch.setInput("!CLR", 0); 
  latch.setInput("!CLR", 1); 

  expect(latch.getOutput("Q")).toBe(0);
  expect(latch.getOutput("!Q")).toBe(1); 

  latch.setInput("!PRE", 0); 
  latch.setInput("!PRE", 1); 

  expect(latch.getOutput("Q")).toBe(1);
  expect(latch.getOutput("!Q")).toBe(0);   
})