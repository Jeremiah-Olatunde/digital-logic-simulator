import LogicBlock from "../logic/LogicBlock.js";
import { DLatch } from "./DLatch.js";

export class PIPO extends LogicBlock {
  constructor(uid: string, private bits: number){
    const latches: LogicBlock[] = [];

    for(let i = 0; i < bits; i++) latches.push(new DLatch(`DL${i}`));

    super(uid, latches, circuit => {
      circuit.addInput("EN");
      circuit.addIdentityGate("ENSPLIT");
      circuit.connect("EN", "ENSPLIT");

      circuit.addInput("!CLR", 1);
      circuit.addIdentityGate("!CLRSPLIT");
      circuit.connect("!CLR", "!CLRSPLIT");      

      for(let i = 0; i < bits; i++){
        circuit.extend(`DL${i}::D`, `D${i}`);
        circuit.extend(`DL${i}::Q`, `Q${i}`);

        circuit.connect("ENSPLIT", `DL${i}::EN`);
        circuit.connect("!CLRSPLIT", `DL${i}::!CLR`);
      }
    });
  }

  public write(D: string): void {
    const DArr = D.split("");

    if(DArr.length !== this.bits) 
      throw new Error(`${D} must be ${this.bits} long`);

    if(!DArr.every(bit => bit == "0" || bit == "1")) 
      throw new Error(`${D} must be ${this.bits} binary`);

    const inputs = DArr.map((bit, i) => [`D${this.bits - i - 1}`, +bit as BoolInt]);  
    this.setInputs(...(inputs as [string, BoolInt][]));

    this.setInput("EN", 1);
    this.setInput("EN", 0);
  }

  public clear(): void {
    this.setInput("!CLR", 0);
    this.setInput("!CLR", 1);
  }

  public read(): string {
    let data = "";
    for(let i = this.bits - 1; -1 < i; i--) data += this.getOutput(`Q${i}`);
    return data;
  }
}