
import { GoLexer } from './GoLexer.js';
import { GoParser } from './GoParser.js';
import { CharStream, CommonTokenStream } from 'antlr4';


const input = "if (3 != 2) {val x := 3;} else {val y := 2;};"
const chars = new CharStream(input); // replace this with a FileStream as required
const lexer = new GoLexer(chars);
const tokens = new CommonTokenStream(lexer);
const parser = new GoParser(tokens);
const tree = parser.expression();
console.log(tree.toStringTree);