type BoolInt = 0 | 1;


export default class CircuitElement {
  public cachedValue: BoolInt = 0;

  constructor(
    public uid: string, 
    public type: "input" | "output" | "gate",
    public inputCount: number,
    public operation: (inputs: BoolInt[]) => BoolInt
  ){}

  public static input(uid: string, value: BoolInt): CircuitElement {
    const input = new CircuitElement(uid, "input", 1, input => input[0]);
    input.cachedValue = value; 
    return input;
  }

  public static output(uid: string, value: BoolInt): CircuitElement {
    const output = new CircuitElement(uid, "output", 1, input => input[0]);
    output.cachedValue = value; 
    return output;
  }

  public static gate(
    uid: string, 
    inputCount: number, 
    logic: (inputs: BoolInt[]) => BoolInt
  ): CircuitElement {
    return new CircuitElement(uid, "gate", inputCount, logic);
  }
}