
export default class CircuitElement {
  public cachedValue: boolean = false;
  public hasValidCache: boolean = false;

  constructor(
    public uid: string, 
    public type: "input" | "output" | "gate",
    public inputCount: number,
    public operation: (inputs: boolean[]) => boolean
  ){}

  public static input(uid: string, value: boolean): CircuitElement {
    const input = new CircuitElement(uid, "input", 1, input => input[0]);
    input.cachedValue = value; 
    input.hasValidCache = true;
    return input;
  }

  public static output(uid: string, value?: boolean): CircuitElement {
    const output = new CircuitElement(uid, "output", 1, input => input[0]);
    if(value !== undefined) output.cachedValue = value; 
    return output;
  }

  public static gate(
    uid: string, 
    inputCount: number, 
    logic: (inputs: boolean[]) => boolean
  ): CircuitElement {
    return new CircuitElement(uid, "gate", inputCount, logic);
  }
}