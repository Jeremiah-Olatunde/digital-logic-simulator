import { test, expect } from "@jest/globals";
import { FrequencyDivider } from "./FrequencyDivider.js";

function pulseCount(clk: number[]): number {
  let prev = 0, count = 0;

  for(const bit of clk) {
    if(bit !== prev) count++;
    prev = bit;
  }

  return count / 2;
}

test("frequency divier", () => {
  const n = 3;
  const FD = new FrequencyDivider("FD", n);
  let Fin: number[] = [];
  let Fout: number[] = [];

  for(let i = 0, clk = 1; i < 16; i++, clk = 1 - clk){
    FD.setInput("Fin", clk as BoolInt);
    Fin.push(clk);
    Fout.push(FD.getOutput("Fout"));
  }

  expect(pulseCount(Fin) / 2 ** n).toBe(pulseCount(Fout));
});