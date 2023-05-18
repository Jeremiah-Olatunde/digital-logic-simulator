 
import Graph from "../graph/graph.js";
import CircuitElement from "./CircuitElement.js";

type BoolInt = 0 | 1;

export default class LogicCircuit {
  public inputs: string[] = [];
  public outputs: string[] = [];
  public circuitGraph: Graph<CircuitElement>;
  public subCircuits: Map<string, { inputs: string[], outputs: string[]}> = new Map();

  constructor(public uid: string){ this.circuitGraph = new Graph(uid); }

  //--- WIRING ----------------------------------------------------------------
    public connect(uid0: string, uid1: string){
      const elmt0 = this.circuitGraph.getVertex(uid0);
      const elmt1 = this.circuitGraph.getVertex(uid1);

      if(elmt0.type === "output" && elmt1.type !== "gate") 
        this.outputs.splice(this.outputs.findIndex(v => elmt0.uid === v), 1);
      if(elmt1.type === "input") 
        this.inputs.splice(this.inputs.findIndex(v => elmt1.uid === v), 1);

      this.circuitGraph.addEdge(uid0, uid1);
    }
  //---------------------------------------------------------------------------
    
  //--- IO --------------------------------------------------------------------
    public addInput(uid: string, value: BoolInt = 0){
      const input = CircuitElement.input(uid, value);
      this.circuitGraph.addVertex(input);
      this.inputs.push(input.uid);
    }

    public addOutput(uid: string, value: BoolInt = 0){
      const output = CircuitElement.output(uid, value)
      this.circuitGraph.addVertex(output);
      this.outputs.push(output.uid);
    }

    public renameInput(uid: string, newUid: string){
      const vertex = this.circuitGraph.expand(uid, this.inputs);
      if(!this.inputs.includes(vertex))
        throw new Error(`INPUT(${uid}) does not exist`);  

      const input = this.circuitGraph.getVertex(uid);
      this.inputs.splice(this.inputs.indexOf(input.uid), 1);
      this.circuitGraph.renameVertex(uid, newUid);
      this.inputs.push(input.uid);
    }

    public renameOutput(uid: string, newUid: string){
      const vertex = this.circuitGraph.expand(uid, this.outputs);
      if(!this.outputs.includes(vertex))
        throw new Error(`OUTPUT(${uid}) does not exist`);  

      const output = this.circuitGraph.getVertex(uid);
      this.outputs.splice(this.outputs.indexOf(output.uid), 1);
      this.circuitGraph.renameVertex(uid, newUid);
      this.outputs.push(output.uid);
    }

    public setInput(uid: string, value: BoolInt){
    const vertex = this.circuitGraph.expand(uid, this.inputs);
    if(!this.inputs.includes(vertex))
      throw new Error(`INPUT(${uid}) does not exist`);  

      this.circuitGraph.dfs(vertex, (v) => {
        const inputs: BoolInt[] = [];

        for(const elmt of this.circuitGraph.getAdjacentVertices(v.uid, "inward"))
          inputs.push(this.circuitGraph.getVertex(elmt).cachedValue);

        const prevValue = v.cachedValue;
        v.cachedValue = v.operation(v.uid == vertex ? [ value ] : inputs);

        return prevValue === v.cachedValue;
      });
    }

    public getInput(uid: string): BoolInt {
      if(!this.inputs.includes(this.circuitGraph.expand(uid, this.inputs)))
        throw new Error(`INPUT(${uid}) does not exist`);       
      return this.circuitGraph.getVertex(uid).cachedValue;
    }

    public getOutput(uid: string): BoolInt {
      const output = this.circuitGraph.expand(uid, this.outputs);
      if(!this.outputs.includes(output))
        throw new Error(`OUTPUT(${uid}) does not exist`);

      return this.circuitGraph.getVertex(output).cachedValue;
    }

    public initialize(){
      for(const input of this.inputs){
        // console.log();
        // console.log("initializing", input);

        this.circuitGraph.dfs(input, (v) => {
          const inputs: [string, BoolInt][] = [];

          for(const elmt of this.circuitGraph.getAdjacentVertices(v.uid, "inward"))
            inputs.push([elmt, this.circuitGraph.getVertex(elmt).cachedValue]);

          v.cachedValue = v.operation(v.uid == input ? [ v.cachedValue ] : inputs.map(v => v[1]));
          // console.log(v.uid, [inputs], v.cachedValue);
        });   
      }
    }
  //---------------------------------------------------------------------------

  //--- LOGIC GATES -----------------------------------------------------------
    public addGate(uid: string, inputCount: number, logic: (inputs: BoolInt[]) => BoolInt){
      this.circuitGraph.addVertex(CircuitElement.gate(uid, inputCount, logic));
    }

    public addIdentityGate(uid: string){
      this.addGate(uid, 1, inputs => inputs[0]);
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

    public addXorGate(uid: string, inputCount: number){
      this.addGate(uid, inputCount, inputs => inputs.reduce((p, v) => (p as number ^ v as number) as BoolInt));
    }

    public addXnorGate(uid: string, inputCount: number){
      this.addGate(uid, inputCount, inputs => inputs.reduce((p, v) => (p as number ^ v as number) as BoolInt) ? 0 : 1);
    }
  //---------------------------------------------------------------------------

  //--- MERGING ---------------------------------------------------------------
    public static merge(
      uid: string, 
      circuitGraph0: LogicCircuit, 
      circuitGraph1: LogicCircuit
    ): LogicCircuit {
      const circuitGraph = new LogicCircuit(uid);

      const { uid: uid0, inputs: inputs0, outputs: outputs0 } = circuitGraph0;
      const { uid: uid1, inputs: inputs1, outputs: outputs1 } = circuitGraph1;

      circuitGraph.subCircuits.set(uid0, { inputs: inputs0, outputs: outputs0 });
      circuitGraph.subCircuits.set(uid1, { inputs: inputs1, outputs: outputs1 });

      circuitGraph.inputs = [...inputs0.map(input => `${uid}::${input}`), ...inputs1.map(input => `${uid}::${input}`)];
      circuitGraph.outputs = [...outputs0.map(input => `${uid}::${input}`), ...outputs1.map(input => `${uid}::${input}`)];

      circuitGraph.circuitGraph = Graph.merge(uid, circuitGraph0.circuitGraph, circuitGraph1.circuitGraph);

      return circuitGraph;
    }
  //---------------------------------------------------------------------------
}

