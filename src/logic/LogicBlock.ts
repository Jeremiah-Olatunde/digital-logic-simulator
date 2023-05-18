
import LogicCircuit from "./LogicCircuit.js";

type BoolInt = 0 | 1;

export class LogicBlock {
  public circuit: LogicCircuit;

  constructor(public uid: string, configure?: (circuit: LogicCircuit) => void){
    this.circuit = new LogicCircuit(uid);
    configure?.(this.circuit);
    this.circuit.initialize();
  }

  public setInput(uid: string, value: BoolInt): void {
    this.circuit.setInput(uid, value);
  }

  public getInput(uid: string): BoolInt {
    return this.circuit.getInput(uid);
  }

  public getOutput(uid: string): BoolInt {
    return this.circuit.getOutput(uid);
  }

  public static merge(
    uid: string, 
    block0: LogicBlock, 
    block1: LogicBlock,
    configure?: (circuit: LogicCircuit) => void
  ): LogicBlock {
    const block = new LogicBlock(uid);
    block.circuit = LogicCircuit.merge(uid, block0.circuit, block1.circuit);
    configure?.(block.circuit);

    return block;
  }
}