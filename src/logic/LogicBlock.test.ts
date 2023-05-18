import { test, describe, expect } from "@jest/globals";
import { LogicBlock } from "./LogicBlock.js";

describe("combinational circuits", () => {
  test("or circuit", () => {
    const or = new LogicBlock("or", (circuit) => {
      circuit.addOutput("X");
      circuit.addInput("A");
      circuit.addInput("B");
      circuit.addOrGate("OR", 2);

      circuit.connect("OR", "X");
      circuit.connect("A", "OR");
      circuit.connect("B", "OR");
    });

    or.setInput("A", 0);
    or.setInput("B", 0);
    expect(or.getOutput("X")).toBe(0 | 0);

    or.setInput("A", 0);
    or.setInput("B", 1);
    expect(or.getOutput("X")).toBe(0 | 1);

    or.setInput("A", 1);
    or.setInput("B", 0);
    expect(or.getOutput("X")).toBe(1 | 0);

    or.setInput("A", 1);
    or.setInput("B", 1);
    expect(or.getOutput("X")).toBe(1 | 1);
  });

  test("and circuit", () => {
    const and = new LogicBlock("and", (circuit) => {
      circuit.addOutput("X");
      circuit.addInput("A");
      circuit.addInput("B");
      circuit.addAndGate("AND", 2);

      circuit.connect("AND", "X");
      circuit.connect("A", "AND");
      circuit.connect("B", "AND");
    });

    and.setInput("A", 0);
    and.setInput("B", 0);
    expect(and.getOutput("X")).toBe(0 & 0);

    and.setInput("A", 0);
    and.setInput("B", 1);
    expect(and.getOutput("X")).toBe(0 & 1);

    and.setInput("A", 1);
    and.setInput("B", 0);
    expect(and.getOutput("X")).toBe(1 & 0);

    and.setInput("A", 1);
    and.setInput("B", 1);
    expect(and.getOutput("X")).toBe(1 & 1);
  });

  test("not circuit", () => {
    const not = new LogicBlock("not", (circuit) => {
      circuit.addOutput("X");
      circuit.addInput("A");
      circuit.addNotGate("NOT");

      circuit.connect("NOT", "X");
      circuit.connect("A", "NOT");
    });

    not.setInput("A", 0);
    expect(not.getOutput("X")).toBe(1);

    not.setInput("A", 1);
    expect(not.getOutput("X")).toBe(0);
  });

  test("xor circuit", () => {
    const xor = new LogicBlock("xor", (circuit) => {
      circuit.addOutput("Y");

      circuit.addInput("A");
      circuit.addInput("B");

      circuit.addNotGate("NOT(A)");
      circuit.addNotGate("NOT(B)");

      circuit.addAndGate("AND(A)", 2);
      circuit.addAndGate("AND(B)", 2);

      circuit.addOrGate("OR(0)", 2);


      circuit.connect("OR(0)", "Y");

      circuit.connect("AND(A)", "OR(0)");
      circuit.connect("AND(B)", "OR(0)");

      circuit.connect("NOT(A)", "AND(A)");
      circuit.connect("NOT(B)", "AND(B)");

      circuit.connect("A", "NOT(A)");
      circuit.connect("B", "NOT(B)");

      circuit.connect("B", "AND(A)");
      circuit.connect("A", "AND(B)");
    });

    xor.setInput("A", 0);
    xor.setInput("B", 0);
    expect(xor.getOutput("Y")).toBe(0 ^ 0);

    xor.setInput("A", 0);
    xor.setInput("B", 1);
    expect(xor.getOutput("Y")).toBe(0 ^ 1);

    xor.setInput("A", 1);
    xor.setInput("B", 0);
    expect(xor.getOutput("Y")).toBe(1 ^ 0);

    xor.setInput("A", 1);
    xor.setInput("B", 1);
    expect(xor.getOutput("Y")).toBe(1 ^ 1);
  });

  test("nand circuit (merging)", () => {
    const and = new LogicBlock("and", (circuit) => {
      circuit.addOutput("X");
      circuit.addInput("A");
      circuit.addInput("B");
      circuit.addAndGate("AND", 2);

      circuit.connect("AND", "X");
      circuit.connect("A", "AND");
      circuit.connect("B", "AND");
    });

    const not = new LogicBlock("not", (circuit) => {
      circuit.addOutput("X");
      circuit.addInput("A");
      circuit.addNotGate("NOT");

      circuit.connect("NOT", "X");
      circuit.connect("A", "NOT");
    });

    const nand = LogicBlock.merge("nand", and, not, circuit => {
      circuit.connect("and::X", "not::A");
    });

    nand.setInput("and::A", 0);
    nand.setInput("and::B", 0);
    expect(nand.getOutput("not::X")).toBe(1);

    nand.setInput("and::A", 0);
    nand.setInput("and::B", 1);
    expect(nand.getOutput("not::X")).toBe(1);

    nand.setInput("and::A", 1);
    nand.setInput("and::B", 0);
    expect(nand.getOutput("not::X")).toBe(1);

    nand.setInput("and::A", 1);
    nand.setInput("and::B", 1);
    expect(nand.getOutput("not::X")).toBe(0);
  });
})

describe("sequential circuits", () => {
  test("sr-latch", () => {
    const sr = new LogicBlock("sr", circuit => {
      circuit.addInput("!R", 1);
      circuit.addInput("!S", 1);

      circuit.addOutput("Q", 1);
      circuit.addOutput("!Q", 0);

      circuit.addNandGate("N(!R)", 2);
      circuit.addNandGate("N(!S)", 2);

      circuit.connect( "N(!S)", "Q");
      circuit.connect("N(!R)", "!Q");

      circuit.connect("!S", "N(!S)");
      circuit.connect("!Q", "N(!S)");

      circuit.connect("!R", "N(!R)");
      circuit.connect("Q", "N(!R)");
    });

    // initial state is set
    expect(sr.getOutput("Q")).toBe(1);
    expect(sr.getOutput("!Q")).toBe(0);

    // reset latch
    sr.setInput("!S", 1);
    sr.setInput("!R", 0); 

    expect(sr.getOutput("Q")).toBe(0);
    expect(sr.getOutput("!Q")).toBe(1);


    // no change
    sr.setInput("!S", 1);
    sr.setInput("!R", 1);
    
    expect(sr.getOutput("Q")).toBe(0);
    expect(sr.getOutput("!Q")).toBe(1);


   // set latch 
    sr.setInput("!S", 0);
    sr.setInput("!R", 1);
    
    expect(sr.getOutput("Q")).toBe(1);
    expect(sr.getOutput("!Q")).toBe(0);
  });  

  test("gated sr-latch", () => {
    const sr = new LogicBlock("sr", circuit => {
      circuit.addInput("!R", 1);
      circuit.addInput("!S", 1);

      circuit.addOutput("Q", 1);
      circuit.addOutput("!Q", 0);

      circuit.addNandGate("N(!R)", 2);
      circuit.addNandGate("N(!S)", 2);

      circuit.connect( "N(!S)", "Q");
      circuit.connect("N(!R)", "!Q");

      circuit.connect("!S", "N(!S)");
      circuit.connect("!Q", "N(!S)");

      circuit.connect("!R", "N(!R)");
      circuit.connect("Q", "N(!R)");
    });

    const en = new LogicBlock("en", circuit => {
      circuit.addInput("S", 0);
      circuit.addInput("R", 0);
      circuit.addInput("EN", 0);

      circuit.addNandGate("N(S)", 2);
      circuit.addNandGate("N(R)", 2);

      circuit.addOutput("X");
      circuit.addOutput("Y");

      circuit.connect("N(S)", "X");
      circuit.connect("N(R)", "Y");

      circuit.connect("S", "N(S)");
      circuit.connect("EN", "N(S)");

      circuit.connect("R", "N(R)");
      circuit.connect("EN", "N(R)");
    });

    const gsr = LogicBlock.merge("gsr", sr, en, circuit => {
      circuit.connect("X", "!S");
      circuit.connect("Y", "!R");
    });


    expect(gsr.getOutput("Q")).toBe(1);
    expect(gsr.getOutput("!Q")).toBe(0);

    gsr.setInput("R", 1);

    expect(gsr.getOutput("Q")).toBe(1);
    expect(gsr.getOutput("!Q")).toBe(0);

    gsr.setInput("EN", 1);

    expect(gsr.getOutput("Q")).toBe(0);
    expect(gsr.getOutput("!Q")).toBe(1);

    gsr.setInput("R", 0);
    gsr.setInput("EN", 0);

    gsr.setInput("S", 1);

    expect(gsr.getOutput("Q")).toBe(0);
    expect(gsr.getOutput("!Q")).toBe(1);

    gsr.setInput("S", 1);
    gsr.setInput("EN", 1);    

    expect(gsr.getOutput("Q")).toBe(1);
    expect(gsr.getOutput("!Q")).toBe(0);
  });
})

export {}