import LogicBlock from "../logic/LogicBlock.js";

export class Decoder extends LogicBlock {
  constructor(uid: string, private bits: number, active: "low" | "high" = "high"){
    super(uid, [], circuit => {
      circuit.addInput("!CS1");
      circuit.addInput("!CS2");
      circuit.addNorGate("EN");

      circuit.connect("!CS1", "EN");
      circuit.connect("!CS2", "EN");

      for(let i = 0; i < bits; i++) circuit.addInput(`A${i}`);

      for(let i = 0; i < 2 ** bits; i++){
        circuit.addOutput(`!X${i}`);
        if(active === "low") circuit.addNandGate(`NAND${i}`);
        else circuit.addAndGate(`NAND${i}`);

        i.toString(2).padStart(bits, "0").split("").forEach((bit, j) => {
          const weight = bits - j - 1;
          if(bit === "0") {
            circuit.addNotGate(`N${i}(!A${weight})`);
            circuit.connect(`A${weight}`, `N${i}(!A${weight})`);
            circuit.connect(`N${i}(!A${weight})`, `NAND${i}`);
          } else {
            circuit.connect(`A${weight}`, `NAND${i}`);
          };
        });

        circuit.connect("EN", `NAND${i}`);
        circuit.connect(`NAND${i}`, `!X${i}`);
      }
    })
  }

  public decode(A: string): string {
    const AArr = A.split("");

    if(AArr.length !== this.bits) 
      throw new Error(`${A} must be ${this.bits} bits`);

    if(!AArr.every(bit => bit == "0" || bit == "1")) 
      throw new Error(`${A} must be a binary number`);

    const inputs = AArr.map((bit, i) => [`A${this.bits - i - 1}`, +bit as BoolInt]);  
    this.setInputs(...(inputs as [string, BoolInt][]));

    let decoded = "";

    for(let i = 0; i < 2 ** this.bits; i++) 
      decoded += this.getOutput(`!X${i}`);
    
    return decoded;
  }
}