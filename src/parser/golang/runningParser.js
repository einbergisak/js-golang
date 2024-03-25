import  GoLexer from "./GoLexer.js";
import GoParser from "./GoParser.js";
import antlr4 from 'antlr4';
import GoParserListener from './GoParserListener.js';
let content = "public class SampleClass { void DoSomething(){} }";
//let myLexer = GoLexer(CharStreams.fromString(content));
// let tokens = new CommonTokenStream(myLexer);
// let myParser = GoParser(tokens);
// let tree = myParser.compilationUnit();


// const antlr4 = require('antlr4');
// const ECMAScriptLexer = require('./GoLexer.js');
// const ECMAScriptParser = require('./lib/ECMAScriptParser.js');
//
 const input = '{x: 1}';
//
const chars = new antlr4.InputStream(input);
const lexer = new GoLexer(chars);
//
lexer.strictMode = false; // do not use js strictMode
//
const tokens = new antlr4.CommonTokenStream(lexer);
const parser = new GoParser(tokens);
const tree = parser.block();
//
console.log(tree.toStringTree);
