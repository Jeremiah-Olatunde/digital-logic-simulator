import { test, describe, expect } from "@jest/globals";
import { LogicBlock } from "./LogicBlock.js";

describe("combinational circuits", () => {
  test("xor circuit", () => {
    const xor = new LogicBlock("xor", (circuit) => {
      circuit.addOutput("Y");

      circuit.addInput("A", 0);
      circuit.addInput("B", 0);

      circuit.addNotGate("NOT:A");
      circuit.addNotGate("NOT:B");

      circuit.addAndGate("AND:A", 2);
      circuit.addAndGate("AND:B", 2);

      circuit.addOrGate("OR:0", 2);


      circuit.connect("Y", "OR:0");

      circuit.connect("OR:0", "AND:A");
      circuit.connect("OR:0", "AND:B");

      circuit.connect("AND:A", "NOT:A");
      circuit.connect("AND:B", "NOT:B");

      circuit.connect("NOT:A", "A");
      circuit.connect("NOT:B", "B");

      circuit.connect("AND:A", "B");
      circuit.connect("AND:B", "A");
    });

    xor.setInput("A", 0);
    xor.setInput("B", 0);
    expect(xor.evaluateOutput("Y")).toBe(0 ^ 0);

    xor.setInput("A", 0);
    xor.setInput("B", 1);
    expect(xor.evaluateOutput("Y")).toBe(0 ^ 1);

    xor.setInput("A", 1);
    xor.setInput("B", 0);
    expect(xor.evaluateOutput("Y")).toBe(1 ^ 0);

    xor.setInput("A", 1);
    xor.setInput("B", 1);
    expect(xor.evaluateOutput("Y")).toBe(1 ^ 1);
  });

  test("or circuit", () => {
    const or = new LogicBlock("or", (circuit) => {
      circuit.addInput("A", 0);
      circuit.addInput("B", 0);

      circuit.addOutput("X");

      circuit.addOrGate("OR", 2);

      circuit.connect("X", "OR");
      circuit.connect("OR", "A");
      circuit.connect("OR", "B");
    });

    or.setInput("A", 0);
    or.setInput("B", 0);
    expect(or.evaluateOutput("X")).toBe(0 | 0);

    or.setInput("A", 0);
    or.setInput("B", 1);
    expect(or.evaluateOutput("X")).toBe(0 | 1);

    or.setInput("A", 1);
    or.setInput("B", 0);
    expect(or.evaluateOutput("X")).toBe(1 | 0);

    or.setInput("A", 1);
    or.setInput("B", 1);
    expect(or.evaluateOutput("X")).toBe(1 | 1);
  });

  test("and circuit", () => {
    const and = new LogicBlock("and", (circuit) => {
      circuit.addInput("A", 0);
      circuit.addInput("B", 0);

      circuit.addOutput("X");

      circuit.addAndGate("AND", 2);

      circuit.connect("X", "AND");
      circuit.connect("AND", "A");
      circuit.connect("AND", "B");
    });

    and.setInput("A", 0);
    and.setInput("B", 0);
    expect(and.evaluateOutput("X")).toBe(0 & 0);

    and.setInput("A", 0);
    and.setInput("B", 1);
    expect(and.evaluateOutput("X")).toBe(0 & 1);

    and.setInput("A", 1);
    and.setInput("B", 0);
    expect(and.evaluateOutput("X")).toBe(1 & 0);

    and.setInput("A", 1);
    and.setInput("B", 1);
    expect(and.evaluateOutput("X")).toBe(1 & 1);
  });

  test("not circuit", () => {
    const not = new LogicBlock("not", (circuit) => {
      circuit.addOutput("X");
      circuit.addInput("A", 0);
      circuit.addNotGate("NOT");

      circuit.connect("X", "NOT");
      circuit.connect("NOT", "A");
    });

    not.setInput("A", 0);
    expect(not.evaluateOutput("X")).toBe(1);

    not.setInput("A", 1);
    expect(not.evaluateOutput("X")).toBe(0);
  });

  test("nand circuit (merging)", () => {
    const and = new LogicBlock("and", (circuit) => {
      circuit.addInput("A", 0);
      circuit.addInput("B", 0);

      circuit.addOutput("X");

      circuit.addAndGate("AND", 2);

      circuit.connect("X", "AND");
      circuit.connect("AND", "A");
      circuit.connect("AND", "B");
    });

    const not = new LogicBlock("not", (circuit) => {
      circuit.addOutput("Y");
      circuit.addInput("C", 0);
      circuit.addNotGate("NOT");

      circuit.connect("Y", "NOT");
      circuit.connect("NOT", "C");
    });

    const nand = LogicBlock.merge("nand", and, not, circuit => circuit.connect("C", "X"));

    nand.setInput("A", 0);
    nand.setInput("B", 0);
    expect(nand.evaluateOutput("Y")).toBe(1);

    nand.setInput("A", 0);
    nand.setInput("B", 1);
    expect(nand.evaluateOutput("Y")).toBe(1);

    nand.setInput("A", 1);
    nand.setInput("B", 0);
    expect(nand.evaluateOutput("Y")).toBe(1);

    nand.setInput("A", 1);
    nand.setInput("B", 1);
    expect(nand.evaluateOutput("Y")).toBe(0);
  });
})

describe("sequential circuits", () => {
  test("sr-latch", () => {
    const sr = new LogicBlock("sr", circuit => {
      circuit.addInput("!R", 1);
      circuit.addInput("!S", 1);

      circuit.addOutput("Q", 1);
      circuit.addOutput("!Q", 0);

      circuit.addNandGate("NAND:!R", 2);
      circuit.addNandGate("NAND:!S", 2);

      circuit.connect("Q", "NAND:!S");
      circuit.connect("!Q", "NAND:!R");

      circuit.connect("NAND:!S", "!S");
      circuit.connect("NAND:!S", "!Q");

      circuit.connect("NAND:!R", "!R");
      circuit.connect("NAND:!R", "Q");
    });

    // initial state is set
    expect(sr.evaluateOutput("Q")).toBe(1);
    expect(sr.evaluateOutput("!Q")).toBe(0);

    // reset latch
    sr.setInput("!S", 1);
    sr.setInput("!R", 0); 

    expect(sr.evaluateOutput("Q")).toBe(0);
    expect(sr.evaluateOutput("!Q")).toBe(1);


    // no change
    sr.setInput("!S", 1);
    sr.setInput("!R", 1);
    
    expect(sr.evaluateOutput("Q")).toBe(0);
    expect(sr.evaluateOutput("!Q")).toBe(1);


   // set latch 
    sr.setInput("!S", 0);
    sr.setInput("!R", 1);
    
    expect(sr.evaluateOutput("Q")).toBe(1);
    expect(sr.evaluateOutput("!Q")).toBe(0);
  });

  test("gated sr-latch", () => {
    const sr = new LogicBlock("sr", circuit => {
      circuit.addInput("!R", 1);
      circuit.addInput("!S", 1);

      circuit.addOutput("Q", 1);
      circuit.addOutput("!Q", 0);

      circuit.addNandGate("NAND:!R", 2);
      circuit.addNandGate("NAND:!S", 2);

      circuit.connect("Q", "NAND:!S");
      circuit.connect("!Q", "NAND:!R");

      circuit.connect("NAND:!S", "!S");
      circuit.connect("NAND:!S", "!Q");

      circuit.connect("NAND:!R", "!R");
      circuit.connect("NAND:!R", "Q");
    });

    const en = new LogicBlock("en", circuit => {
      circuit.addInput("S", 0);
      circuit.addInput("R", 0);
      circuit.addInput("EN", 0);

      circuit.addNandGate("NAND:S", 2);
      circuit.addNandGate("NAND:R", 2);

      circuit.addOutput("X");
      circuit.addOutput("Y");

      circuit.connect("X", "NAND:S");
      circuit.connect("Y", "NAND:R");

      circuit.connect("NAND:S", "S");
      circuit.connect("NAND:S", "EN");

      circuit.connect("NAND:R", "R");
      circuit.connect("NAND:R", "EN");
    });

    const gsr = LogicBlock.merge("gsr", sr, en, circuit => {
      circuit.connect("!S", "X");
      circuit.connect("!R", "Y");
    });


    expect(gsr.evaluateOutput("Q")).toBe(1);
    expect(gsr.evaluateOutput("!Q")).toBe(0);

    gsr.setInput("R", 1);

    expect(gsr.evaluateOutput("Q")).toBe(1);
    expect(gsr.evaluateOutput("!Q")).toBe(0);

    gsr.setInput("EN", 1);

    expect(gsr.evaluateOutput("Q")).toBe(0);
    expect(gsr.evaluateOutput("!Q")).toBe(1);

    gsr.setInput("R", 0);
    gsr.setInput("EN", 0);

    gsr.setInput("S", 1);

    expect(gsr.evaluateOutput("Q")).toBe(0);
    expect(gsr.evaluateOutput("!Q")).toBe(1);

    gsr.setInput("S", 1);
    gsr.setInput("EN", 1);    

    expect(gsr.evaluateOutput("Q")).toBe(1);
    expect(gsr.evaluateOutput("!Q")).toBe(0);
  })
})

export {}