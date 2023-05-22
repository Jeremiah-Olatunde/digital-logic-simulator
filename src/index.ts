import { XBitFullAdder } from "./circuits/FullAdder.js" ;

const adder = new XBitFullAdder("2Bit", 4);
console.log(adder.add("0001", "0011"));


export {}