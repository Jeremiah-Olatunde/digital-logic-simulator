import LogicBlock from "../logic/LogicBlock.js";

export class HalfAdder extends LogicBlock {
  constructor(uid: string){
    super(uid, [], circuit => {
      circuit.addInput("A");
      circuit.addInput("B");
      circuit.addOutput("S");
      circuit.addOutput("C");
      circuit.addAndGate("AND");
      circuit.addXorGate("XOR");

      circuit.connect("A", "AND");
      circuit.connect("B", "AND");

      circuit.connect("A", "XOR");
      circuit.connect("B", "XOR");

      circuit.connect("AND", "C");
      circuit.connect("XOR", "S");
    });
  }
}