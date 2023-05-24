import LogicBlock from "../logic/LogicBlock.js";
import { DLatch } from "./DLatch.js";

export class AsynchronousCounter extends LogicBlock {
  constructor(uid: string, private bits: number){
    const latches: LogicBlock[] = [];

    for(let i = 0; i < bits; i++) 
      latches.push(new DLatch(`D${i}`));

    super(uid, latches, circuit => {
      for(let i = 0; i < bits; i++) {
        circuit.connect(`D${i}::!Q`, `D${i}::EN`);
        circuit.extend(`D${i}::Q`, `Q${i}`);
        if(bits - 1 - i) circuit.connect(`D${i}::!Q`, `D${i + 1}::EN`);
      }

      circuit.extend("D0::EN", "EN");
    });
  }

  public getValue(): string {
    let value = "";
    for(let i = this.bits - 1; -1 < i; i--)
      value += this.getOutput(`Q${i}`)
    return value
  }


  public increment(){
    this.setInput("EN", 1);
    this.setInput("EN", 0);
  }

}

export {}