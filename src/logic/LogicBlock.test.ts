import { test, describe, expect } from "@jest/globals";
import { LogicBlock } from "./LogicBlock.js";

describe("combinational circuits", () => {
  test("xor circuit", () => {
    const xor = new LogicBlock("xor", (circuit) => {
      circuit.addOutput("Y");

      circuit.addInput("A", false);
      circuit.addInput("B", false);

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

    xor.setInput("A", false);
    xor.setInput("B", false);
    expect(xor.evaluateOutput("Y")).toBe(Boolean(0 ^ 0));

    xor.setInput("A", false);
    xor.setInput("B", true);
    expect(xor.evaluateOutput("Y")).toBe(Boolean(0 ^ 1));

    xor.setInput("A", true);
    xor.setInput("B", false);
    expect(xor.evaluateOutput("Y")).toBe(Boolean(1 ^ 0));

    xor.setInput("A", true);
    xor.setInput("B", true);
    expect(xor.evaluateOutput("Y")).toBe(Boolean(1 ^ 1));
  });

  test("or circuit", () => {
    const or = new LogicBlock("or", (circuit) => {
      circuit.addInput("A", false);
      circuit.addInput("B", false);

      circuit.addOutput("X");

      circuit.addOrGate("OR", 2);

      circuit.connect("X", "OR");
      circuit.connect("OR", "A");
      circuit.connect("OR", "B");
    });

    or.setInput("A", false);
    or.setInput("B", false);
    expect(or.evaluateOutput("X")).toBe(Boolean(0 || 0));

    or.setInput("A", false);
    or.setInput("B", true);
    expect(or.evaluateOutput("X")).toBe(Boolean(0 || 1));

    or.setInput("A", true);
    or.setInput("B", false);
    expect(or.evaluateOutput("X")).toBe(Boolean(1 || 0));

    or.setInput("A", true);
    or.setInput("B", true);
    expect(or.evaluateOutput("X")).toBe(Boolean(1 || 1));
  });

  test("and circuit", () => {
    const and = new LogicBlock("and", (circuit) => {
      circuit.addInput("A", false);
      circuit.addInput("B", false);

      circuit.addOutput("X");

      circuit.addAndGate("AND", 2);

      circuit.connect("X", "AND");
      circuit.connect("AND", "A");
      circuit.connect("AND", "B");
    });

    and.setInput("A", false);
    and.setInput("B", false);
    expect(and.evaluateOutput("X")).toBe(Boolean(0 && 0));

    and.setInput("A", false);
    and.setInput("B", true);
    expect(and.evaluateOutput("X")).toBe(Boolean(0 && 1));

    and.setInput("A", true);
    and.setInput("B", false);
    expect(and.evaluateOutput("X")).toBe(Boolean(1 && 0));

    and.setInput("A", true);
    and.setInput("B", true);
    expect(and.evaluateOutput("X")).toBe(Boolean(1 && 1));
  });

  test("not circuit", () => {
    const not = new LogicBlock("not", (circuit) => {
      circuit.addOutput("X");
      circuit.addInput("A", false);
      circuit.addNotGate("NOT");

      circuit.connect("X", "NOT");
      circuit.connect("NOT", "A");
    });

    not.setInput("A", false);
    expect(not.evaluateOutput("X")).toBe(!(0));

    not.setInput("A", true);
    expect(not.evaluateOutput("X")).toBe(!(1));
  });

  test("nand circuit (merging)", () => {
    const and = new LogicBlock("and", (circuit) => {
      circuit.addInput("A", false);
      circuit.addInput("B", false);

      circuit.addOutput("X");

      circuit.addAndGate("AND", 2);

      circuit.connect("X", "AND");
      circuit.connect("AND", "A");
      circuit.connect("AND", "B");
    });

    const not = new LogicBlock("not", (circuit) => {
      circuit.addOutput("Y");
      circuit.addInput("C", false);
      circuit.addNotGate("NOT");

      circuit.connect("Y", "NOT");
      circuit.connect("NOT", "C");
    });

    const nand = LogicBlock.merge("nand", and, not, circuit => circuit.connect("C", "X"));

    nand.setInput("A", false);
    nand.setInput("B", false);
    expect(nand.evaluateOutput("Y")).toBe(Boolean(!(0 && 0)));

    nand.setInput("A", false);
    nand.setInput("B", true);
    expect(nand.evaluateOutput("Y")).toBe(Boolean(!(0 && 1)));

    nand.setInput("A", true);
    nand.setInput("B", false);
    expect(nand.evaluateOutput("Y")).toBe(Boolean(!(1 && 0)));

    nand.setInput("A", true);
    nand.setInput("B", true);
    expect(nand.evaluateOutput("Y")).toBe(Boolean(!(1 && 1)));
  });
})

describe("sequential circuits", () => {
  test("sr-latch", () => {
    const sr = new LogicBlock("sr", circuit => {
      circuit.addInput("!R", true);
      circuit.addInput("!S", true);

      circuit.addOutput("Q", true);
      circuit.addOutput("!Q", false);

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
    expect(sr.evaluateOutput("Q")).toBe(true);
    expect(sr.evaluateOutput("!Q")).toBe(false);

    // reset latch
    sr.setInput("!S", true);
    sr.setInput("!R", false); 

    expect(sr.evaluateOutput("Q")).toBe(false);
    expect(sr.evaluateOutput("!Q")).toBe(true);


    // no change
    sr.setInput("!S", true);
    sr.setInput("!R", true);
    
    expect(sr.evaluateOutput("Q")).toBe(false);
    expect(sr.evaluateOutput("!Q")).toBe(true);


   // set latch 
    sr.setInput("!S", false);
    sr.setInput("!R", true);
    
    expect(sr.evaluateOutput("Q")).toBe(true);
    expect(sr.evaluateOutput("!Q")).toBe(false);
  });

  test("gated sr-latch", () => {
    const sr = new LogicBlock("sr", circuit => {
      circuit.addInput("!R", true);
      circuit.addInput("!S", true);

      circuit.addOutput("Q", true);
      circuit.addOutput("!Q", false);

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
      circuit.addInput("S", false);
      circuit.addInput("R", false);
      circuit.addInput("EN", false);

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


    expect(gsr.evaluateOutput("Q")).toBe(true);
    expect(gsr.evaluateOutput("!Q")).toBe(false);

    gsr.setInput("R", true);

    expect(gsr.evaluateOutput("Q")).toBe(true);
    expect(gsr.evaluateOutput("!Q")).toBe(false);

    gsr.setInput("EN", true);

    expect(gsr.evaluateOutput("Q")).toBe(false);
    expect(gsr.evaluateOutput("!Q")).toBe(true);

    gsr.setInput("R", false);
    gsr.setInput("EN", false);

    gsr.setInput("S", true);

    expect(gsr.evaluateOutput("Q")).toBe(false);
    expect(gsr.evaluateOutput("!Q")).toBe(true);

    gsr.setInput("S", true);
    gsr.setInput("EN", true);    

    expect(gsr.evaluateOutput("Q")).toBe(true);
    expect(gsr.evaluateOutput("!Q")).toBe(false);
  })
})

export {}