import LogicBlock from "../logic/LogicBlock.js";
import { DLatch } from "./DLatch.js";

export class FrequencyDivider extends LogicBlock {
  constructor(uid: string, n: number){
    const latches: LogicBlock[] = [];

    for(let i = 0; i < n; i++) 
      latches.push(new DLatch(`D${i}`));

    super(uid, latches, circuit => {
      for(let i = 0; i < n; i++) {
        circuit.connect(`D${i}::!Q`, `D${i}::D`);
        if(n - 1 - i) circuit.connect(`D${i}::Q`, `D${i + 1}::EN`);
      }

      circuit.extend("D0::EN", "Fin");
      circuit.extend(`D${n - 1}::Q`, "Fout");
    });
  }
}

export {}