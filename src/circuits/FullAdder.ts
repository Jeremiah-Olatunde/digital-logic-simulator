import LogicBlock from "../logic/LogicBlock.js";
import { HalfAdder } from "./HalfAdder.js";

export class FullAdder extends LogicBlock {
  constructor(uid: string){
    super(uid, [new HalfAdder("HA0"), new HalfAdder("HA1")], circuit => {
      circuit.extend("HA0::A", "A");
      circuit.extend("HA0::B", "B");
      circuit.extend("HA1::S", "S");
      circuit.extend("HA1::B", "Cin");

      circuit.addOutput("Cout");
      circuit.addOrGate("OR");

      circuit.connect("HA0::S", "HA1::A");
      circuit.connect("HA0::C", "OR");
      circuit.connect("HA1::C", "OR");
      circuit.connect("OR", "Cout");      
    });
    
  }
}

export class XBitFullAdder extends LogicBlock {

  constructor(uid: string, private bits: number){
    const adders: LogicBlock[] = [];

    for(let i = 0; i < bits; i++)
      adders.push(new FullAdder(`FA${i}`));

    super(uid, adders, circuit => {
      for(let i = 0; i < bits - 1; i++){
        circuit.connect(`FA${i}::Cout`, `FA${i + 1}::Cin`);

        circuit.extend(`FA${i}::A`, `A${i}`);
        circuit.extend(`FA${i}::B`, `B${i}`);
        circuit.extend(`FA${i}::S`, `S${i}`);

        circuit.extend(`FA${i + 1}::A`, `A${i + 1}`);
        circuit.extend(`FA${i + 1}::B`, `B${i + 1}`);
        circuit.extend(`FA${i + 1}::S`, `S${i + 1}`);
      }

      circuit.extend(`FA${bits - 1}::Cout`, "Cout");
    });
  }

  public add(A: string, B: string): string {
    const AArr = A.split("");
    const BArr = B.split("");
    if(AArr.length !== this.bits && BArr.length !== this.bits) 
      throw new Error("Bit length mismatch");

    if(
      AArr.every(bit => bit !== "0" && bit !== "1") ||
      BArr.every(bit => bit !== "0" && bit !== "1")
    ) throw new Error("A and B must be binary strings");

    AArr.forEach((bit, i) => this.setInput(`A${this.bits - 1 - i}`, +bit as 0 | 1));
    BArr.forEach((bit, i) => this.setInput(`B${this.bits - 1 - i}`, +bit as 0 | 1));

    let sum: string = "";

    for(let i = 0; i < 4; i++)
      sum +=  this.getOutput(`S${3 - i}`).toString();
    
    return sum;
  }
}