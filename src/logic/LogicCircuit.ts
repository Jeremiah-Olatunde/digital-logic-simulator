
import Graph from "../graph/graph.js";
import CircuitElement from "./CircuitElement.js";

type BoolInt = 0 | 1;

export default class LogicCircuit {
  public inputs: Set<string> = new Set();
  public outputs: Set<string> = new Set();
  public circuit: Graph<CircuitElement>;
  public subCircuits: Map<string, { inputs: Set<string>, outputs: Set<string>}> = new Map();

  constructor(public uid: string){ this.circuit = new Graph(uid); }

  //--- WIRING ----------------------------------------------------------------
    public connect(uid0: string, uid1: string){
      const elmt0 = this.circuit.getVertex(uid0);
      const elmt1 = this.circuit.getVertex(uid1);
      if(elmt0.type === "input" && elmt1.type === "output"){
        elmt0.hasValidCache = false;
        this.inputs.delete(uid0);
        this.outputs.delete(uid1)
      }
      this.circuit.addEdge(uid0, uid1);
    }
  //---------------------------------------------------------------------------
    
  //--- IO --------------------------------------------------------------------
    public addInput(uid: string, value: BoolInt){
      this.circuit.addVertex(CircuitElement.input(uid, value));
      this.inputs.add(uid);
    }

     public addOutput(uid: string, value?: BoolInt){
      this.circuit.addVertex(CircuitElement.output(uid, value));
      this.outputs.add(uid);
    }

    public setInput(uid: string, value: BoolInt){
      if(!this.inputs.has(uid)) throw new Error(`INPUT(${uid}) does not exist`);
      // if(this.circuit.getVertex(uid).cachedValue === value) return;
      this.circuit.getVertex(uid).cachedValue = value;
    }

    public getInput(uid: string): BoolInt {
      if(!this.inputs.has(uid)) throw new Error(`INPUT(${uid}) does not exist`);
      return this.circuit.getVertex(uid).cachedValue;
    }
  //---------------------------------------------------------------------------

  //--- LOGIC GATES -----------------------------------------------------------
    public addGate(uid: string, inputCount: number, logic: (inputs: BoolInt[]) => BoolInt){
      this.circuit.addVertex(CircuitElement.gate(uid, inputCount, logic));
    }

    public addNotGate(uid: string){
      this.addGate(uid, 1, inputs => inputs[0] ? 0 : 1);
    }

    public addOrGate(uid: string, inputCount: number){
      this.addGate(uid, inputCount, inputs => inputs.reduce((p, v) => p || v));
    }

    public addNorGate(uid: string, inputCount: number){
      this.addGate(uid, inputCount, inputs => inputs.reduce((p, v) => p || v) ? 0 : 1);
    }

    public addAndGate(uid: string, inputCount: number){
      this.addGate(uid, inputCount, inputs => inputs.reduce((p, v) => p && v));
    }
    
    public addNandGate(uid: string, inputCount: number){
      this.addGate(uid, inputCount, inputs => inputs.reduce((p, v) => p && v) ? 0 : 1);
    }
  //---------------------------------------------------------------------------

  //--- MERGING ---------------------------------------------------------------
    public static merge(
      uid: string, 
      circuit0: LogicCircuit, 
      circuit1: LogicCircuit
    ): LogicCircuit {
      const { uid: uid0, inputs: inputs0, outputs: outputs0 } = circuit0;
      const { uid: uid1, inputs: inputs1, outputs: outputs1 } = circuit1;
      const circuit = new LogicCircuit(uid);

      circuit.inputs = new Set([...inputs0, ...inputs1]);
      circuit.outputs = new Set([...outputs0, ...outputs1]);

      circuit.subCircuits.set(uid0, { inputs: inputs0, outputs: outputs0 });
      circuit.subCircuits.set(uid1, { inputs: inputs1, outputs: outputs1 });

      circuit.circuit = Graph.merge(uid, circuit0.circuit, circuit1.circuit);

      return circuit;
    }
  //---------------------------------------------------------------------------

  //--- EVALUATION ------------------------------------------------------------
    public evaluateOutput(uid: string): BoolInt {
      if(!this.outputs.has(uid)) throw new Error(`OUTPUT(${uid}) NOT FOUND`);

      const accum: [string, BoolInt][] = [];

      this.circuit.dfs(uid, "outward", {
        preOrder: (v, { visited }) => { 
          if(v.hasValidCache || visited) accum.push([v.uid, v.cachedValue]);
          return v.hasValidCache;
        },

        postOrder: (v) => {
          const output = v.operation(accum.splice(-v.inputCount).map(i => i[1]));
          v.cachedValue = output; 
          accum.push([v.uid, output]);
        }
      });

      return accum[0][1];
    }
  //---------------------------------------------------------------------------
}

