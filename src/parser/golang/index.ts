const { CharStream, CommonTokenStream } = require('antlr4');

const { GoLexer } = require('./GoLexer.js');
const { GoParser } = require('./GoParser.js');

const input = "if (3 != 2) {val x := 3;} else {val y := 2;};"
const chars = new CharStream(input); // replace this with a FileStream as required
const lexer = new GoLexer(chars);
const tokens = new CommonTokenStream(lexer);
const parser = new GoParser(tokens);
const tree = parser.expression();
console.log(tree.toStringTree);