import LogicBlock from "../logic/LogicBlock.js";

export class DLatch extends LogicBlock {
  constructor(uid: string){
    super(uid, [], circuit => {
      circuit.addInput("D");
      circuit.addInput("EN");
      circuit.addInput("!PRE", 1);
      circuit.addInput("!CLR", 1);

      circuit.addOutput("Q", 0);
      circuit.addOutput("!Q", 1);

      circuit.addNotGate("NOT(D)");
      circuit.addNandGate("NAND(D)");
      circuit.addNandGate("NAND(!D)");
      circuit.addNandGate("NAND(Q)");
      circuit.addNandGate("NAND(!Q)");

      circuit.connect("D", "NOT(D)");
      circuit.connect("NOT(D)", "NAND(!D)");
      circuit.connect("D", "NAND(D)");

      circuit.connect("EN", "NAND(D)");
      circuit.connect("EN", "NAND(!D)");

      circuit.connect("NAND(D)", "NAND(Q)");
      circuit.connect("NAND(!D)", "NAND(!Q)");

      circuit.connect("Q", "NAND(!Q)");
      circuit.connect("!Q", "NAND(Q)");

      circuit.connect("NAND(Q)", "Q");
      circuit.connect("NAND(!Q)", "!Q");

      circuit.connect("!PRE", "NAND(Q)");
      circuit.connect("!PRE", "NAND(D)");

      circuit.connect("!CLR", "NAND(!Q)");
      circuit.connect("!CLR", "NAND(!D)");      
    });
  }
}