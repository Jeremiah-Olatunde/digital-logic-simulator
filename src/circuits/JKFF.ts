import LogicBlock from "../logic/LogicBlock.js";

class JK extends LogicBlock {
  constructor(uid: string){
    super(uid, [], circuit => {
      circuit.addInput("J", 1);
      circuit.addInput("K", 0);
      circuit.addInput("CLK");

      circuit.addOutput("Q", 0);
      circuit.addOutput("!Q", 1);

      circuit.addNandGate("NAND(Q)");
      circuit.addNandGate("NAND(!Q)");
      circuit.addNandGate("NAND(J)");
      circuit.addNandGate("NAND(K)");

      circuit.connect("J", "NAND(J)");
      circuit.connect("K", "NAND(K)");

      circuit.connect("CLK", "NAND(J)");
      circuit.connect("CLK", "NAND(K)");

      circuit.connect("NAND(J)", "NAND(Q)");
      circuit.connect("NAND(K)", "NAND(!Q)");

      circuit.connect("NAND(Q)", "Q");
      circuit.connect("NAND(!Q)", "!Q");

      circuit.connect("Q", "NAND(!Q)");
      circuit.connect("!Q", "NAND(Q)");

      circuit.connect("Q", "NAND(K)");
      circuit.connect("!Q", "NAND(J)");
    })
  }
}

const jk = new JK("JK");

console.log(jk.getOutput("Q"), jk.getOutput("!Q"));

jk.setInput("CLK", 1);
jk.setInput("CLK", 0);

console.log(jk.getOutput("Q"), jk.getOutput("!Q"));
console.log("");

jk.setInput("J", 0);
jk.setInput("K", 1);

console.log(jk.getOutput("Q"), jk.getOutput("!Q"));

jk.setInput("CLK", 1);
jk.setInput("CLK", 0);

console.log(jk.getOutput("Q"), jk.getOutput("!Q"));
console.log();

jk.setInput("J", 0);
jk.setInput("K", 0);

console.log(jk.getOutput("Q"), jk.getOutput("!Q"));

jk.setInput("CLK", 1);
jk.setInput("CLK", 0);

console.log(jk.getOutput("Q"), jk.getOutput("!Q"));
console.log();

jk.setInput("J", 1);
jk.setInput("K", 1);

console.log(jk.getOutput("Q"), jk.getOutput("!Q"));

jk.setInput("CLK", 1);
jk.setInput("CLK", 1);

console.log(jk.getOutput("Q"), jk.getOutput("!Q"));


