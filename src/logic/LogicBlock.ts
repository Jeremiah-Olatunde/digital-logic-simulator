
import LogicCircuit from "./LogicCircuit.js";

export class LogicBlock {
  public circuit: LogicCircuit;

  constructor(public uid: string, configure?: (circuit: LogicCircuit) => void){
    this.circuit = new LogicCircuit(uid);
    configure?.(this.circuit);
  }

  public setInput(uid: string, value: boolean): void {
    this.circuit.setInput(uid, value);
  }

  public getInput(uid: string): boolean {
    return this.circuit.getInput(uid);
  }

  public evaluateOutput(uid: string): boolean {
    return this.circuit.evaluateOutput(uid);
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