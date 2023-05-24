
export default class CircuitElement {
  public value: BoolInt = 0;

  constructor(
    public uid: string, 
    public operation: (inputs: BoolInt[]) => BoolInt
  ){}

  public static input(uid: string, value: BoolInt): CircuitElement {
    const input = new CircuitElement(uid, input => input[0]);
    input.value = value; 
    return input;
  }

  public static output(uid: string, value: BoolInt): CircuitElement {
    const output = new CircuitElement(uid, input => input[0]);
    output.value = value; 
    return output;
  }

  public static gate(
    uid: string, 
    logic: (inputs: BoolInt[]) => BoolInt
  ): CircuitElement {
    return new CircuitElement(uid, logic);
  }
}