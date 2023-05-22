 
import Graph from "../graph/graph.js";
import CircuitElement from "./CircuitElement.js";

type BoolInt = 0 | 1;

export default class LogicCircuit {
  private graph: Graph<CircuitElement>;
  private gates: Map<string, string> = new Map();
  private inputs: Map<string, string> = new Map();
  private outputs: Map<string, string> = new Map();
  private subCircuits: Map<string, { 
    inputs: Map<string, string>, 
    outputs: Map<string, string> 
  }> = new Map();


  constructor(public uid: string){ this.graph = new Graph(uid); }

  //--- CIRCUIT CONSTRUCTION --------------------------------------------------
    public addInput(uid: string, value: BoolInt = 0){
      const input = CircuitElement.input(uid, value);
      this.graph.addVertex(input);
      this.inputs.set(uid, input.uid);
    }

    public addOutput(uid: string, value: BoolInt = 0){
      const output = CircuitElement.output(uid, value)
      this.graph.addVertex(output);
      this.outputs.set(uid, output.uid);
    }

    public addGate(uid: string, logic: (inputs: BoolInt[]) => BoolInt){
      const gate = CircuitElement.gate(uid, logic)
      this.graph.addVertex(gate);
      this.gates.set(uid, gate.uid);
    }   

    public connect(uid0: string, uid1: string){
      // WITHIN CIRCUIT CONNECTIONS
      // INPUT -> GATE and GATE -> GATE | OUTPUT
      if(!uid0.match("::") && !uid1.match("::")){
        if(this.inputs.has(uid0) && this.gates.has(uid1))
          this.graph.addEdge(this.inputs.get(uid0)!, this.gates.get(uid1)!);

        else if(this.gates.has(uid0) && this.gates.has(uid1))
          this.graph.addEdge(this.gates.get(uid0)!, this.gates.get(uid1)!);

        else if(this.gates.has(uid0) && this.outputs.has(uid1))
          this.graph.addEdge(this.gates.get(uid0)!, this.outputs.get(uid1)!);  

        else if(this.outputs.has(uid0) && this.gates.has(uid1))
          this.graph.addEdge(this.outputs.get(uid0)!, this.gates.get(uid1)!);          

        else 
          throw new Error(`circuit to circuit connection error ${uid0} -> ${uid1}`);
      }

      // SUBCIRCUIT TO CIRCUIT CONNECTIONS
      // OUTPUT -> GATE
      if(uid0.match("::") && !uid1.match("::")){
        const [c, el] = uid0.split("::");
        const output = this.subCircuits.get(c)?.outputs.get(el);

        if(output && this.gates.has(uid1))
          this.graph.addEdge(output, this.gates.get(uid1)!);
        else 
          throw new Error(`subcircuit to circuit connection error ${uid0} -> ${uid1}`);
      }

      // CIRCUIT TO SUBSCIRCUIT CONNECTIONS
      // GATE -> INPUT
      if(!uid0.match("::") && uid1.match("::")){
        const [c, el] = uid1.split("::");
        const input = this.subCircuits.get(c)?.inputs.get(el);

        if(input && this.gates.has(uid0))
          this.graph.addEdge(input, this.gates.get(uid1)!);  
         else 
          throw new Error(`circuit to sub-circuit connection error ${uid0} -> ${uid1}`);               
      }

      // SUBCIRCUIT TO SUBCIRCUIT CONNECTIONS
      // OUTPUT TO INPUT
      if(uid0.match("::") && uid1.match("::")){
        const [c0, el0] = uid0.split("::");
        const output = this.subCircuits.get(c0)?.outputs.get(el0);

        const [c1, el1] = uid1.split("::"); 
        const input = this.subCircuits.get(c1)?.inputs.get(el1);

        if(output && input) 
          this.graph.addEdge(output, input);  
        else 
          throw new Error(`subcircuit to subcircuit connection error ${uid0} -> ${uid1}`);
      }
    }   

    public extend(uid: string, name: string){
      const [ c, el ] = uid.split("::");

      if(!c && !el) 
        throw new Error(`invalid identifier ${uid}`);
      
      const input = this.subCircuits.get(c)?.inputs.get(el);
      const output = this.subCircuits.get(c)?.outputs.get(el);

      if(!((input && this.inputs.set(name, input)) || (output && this.outputs.set(name, output)))){
        throw new Error(`subcircuit(${c}) or input|output(${el}) not found`);
      }
    } 
  //---------------------------------------------------------------------------
    
  //--- CIRCUIT INTERFACING -----------------------------------------------------------
    public setInput(name: string, value: BoolInt){
      const input = this.inputs.get(name);
      if(!input) throw new Error(`input(${name}) not found`);

      this.graph.getVertex(input).value = value;
      this.evaluate(input, true);
    }

    public getOutput(name: string): BoolInt {
      const output = this.outputs.get(name);
      if(!output) throw new Error(`output(${name}) not found`);

      return this.graph.getVertex(output).value;
    }
  //----------------------------------------------------------------------------

  //--- CIRCUIT EVALUATION -----------------------------------------------------
    public initialize(){
      this.inputs.forEach(input => this.evaluate(input, false));
    }

    public evaluate(start: string, optimized: boolean){
      this.graph.dfs(`${start}`, (v) => {
        const inputs: [string, BoolInt][] = [];

        for(const elmt of this.graph.getAdjacentVertices(v.uid, "inward"))
          inputs.push([elmt, this.graph.getVertex(elmt).value]);

        const prevValue = v.value;
        v.value = v.operation(v.uid == start ? [ v.value ] : inputs.map(v => v[1]));

        return v.uid !== start && prevValue === v.value && optimized;
      });
    }
  //---------------------------------------------------------------------------

  //--- CIRCUIT MERGING ---------------------------------------------------------------
    public static merge(
      uid: string, 
      circuits: LogicCircuit[]
    ): LogicCircuit {
      const newCircuit = new LogicCircuit(uid);

      const graphs: Graph<CircuitElement>[] = [];

      circuits.forEach(circuit => {
        graphs.push(circuit.graph);

        newCircuit.subCircuits.set(circuit.uid, {
          inputs: new Map([...circuit.inputs].map(([k, v]) => [k, `${uid}::${v}`])),
          outputs: new Map([...circuit.outputs].map(([k, v]) => [k, `${uid}::${v}`])),
        })
      });

      newCircuit.graph = Graph.merge(uid, graphs);
      return newCircuit;
    }
  //---------------------------------------------------------------------------

  //--- LOGIC GATES -----------------------------------------------------------
    public addIdentityGate(uid: string){
      this.addGate(uid, inputs => inputs[0]);
    }    

    public addNotGate(uid: string){
      this.addGate(uid, inputs => inputs[0] ? 0 : 1);
    }

    public addOrGate(uid: string){
      this.addGate(uid, inputs => inputs.reduce((p, v) => p || v));
    }

    public addNorGate(uid: string){
      this.addGate(uid, inputs => inputs.reduce((p, v) => p || v) ? 0 : 1);
    }

    public addAndGate(uid: string){
      this.addGate(uid, inputs => inputs.reduce((p, v) => p && v));
    }
    
    public addNandGate(uid: string){
      this.addGate(uid, inputs => inputs.reduce((p, v) => p && v) ? 0 : 1);
    }

    public addXorGate(uid: string){
      this.addGate(uid, inputs => inputs.reduce((p, v) => (p as number ^ v as number) as BoolInt));
    }

    public addXnorGate(uid: string){
      this.addGate(uid, inputs => inputs.reduce((p, v) => (p as number ^ v as number) as BoolInt) ? 0 : 1);
    }
  //---------------------------------------------------------------------------
}

