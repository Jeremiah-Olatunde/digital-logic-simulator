import { test, expect } from "@jest/globals";
import { Decoder } from "./Decoder.js";

test("active low decoder (4 bit)", () => {
  const decoder = new Decoder("4to16", 4, "low");

  for(let i = 0; i < 2 ** 4; i++){
    const decoded = decoder.decode(i.toString(2).padStart(4, "0"));
    const activeOutput = decoded.split("").findIndex(bit => bit === "0");
    expect(i).toBe(activeOutput);
  }
})

test("active high decoder (4 bit)", () => {
  const decoder = new Decoder("4to16", 4, "high");

  for(let i = 0; i < 2 ** 4; i++){
    const decoded = decoder.decode(i.toString(2).padStart(4, "0"));
    const activeOutput = decoded.split("").findIndex(bit => bit === "1");
    expect(i).toBe(activeOutput);
  }
})

test("active high decoder (8 bit)", () => {
  const decoder = new Decoder("8to256", 8, "high");

  for(let i = 0; i < 2 ** 8; i++){
    const decoded = decoder.decode(i.toString(2).padStart(8, "0"));
    const activeOutput = decoded.split("").findIndex(bit => bit === "1");
    expect(i).toBe(activeOutput);
  }
})


