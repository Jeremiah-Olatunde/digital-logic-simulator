import LogicCircuit from "./LogicCircuit.js";

export default class LogicBlock {
  private circuit: LogicCircuit;

  constructor(public uid: string, blocks: LogicBlock[], configure?: (circuit: LogicCircuit) => void){
    this.circuit = LogicCircuit.merge(uid, blocks.map(block => block.circuit));
    configure?.(this.circuit);
    this.circuit.initialize();
  }

  public setInput(uid: string, value: BoolInt): void {
    this.circuit.setInput(uid, value);
  }

  public setInputs(...inputs: [string, BoolInt][]){
    inputs.forEach(([name, value]) =>  this.setInput(name, value));
  }  

  public getOutput(uid: string): BoolInt {
    return this.circuit.getOutput(uid);
  }
}