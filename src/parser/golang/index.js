import antlr4 from 'antlr4';
import GoLexer from './GoLexer.js';
import GoParser from './GoParser.js';
import GoParserListener from './GoParserListener.js';

const input = `

package main

import "fmt"

func main() {

    var a = "initial"
    fmt.Println(a)

    var b, c int = 1, 2
    fmt.Println(b, c)

    var d = true
    fmt.Println(d)

    var e int
    fmt.Println(e)

    f := "apple"
    fmt.Println(f)
}`
const chars = new antlr4.InputStream(input);
const lexer = new GoLexer(chars);
const tokens = new antlr4.CommonTokenStream(lexer);
const parser = new GoParser(tokens);
const tree = parser.sourceFile();
// TODO: Walker/Listener to traverse parse tree and do what we want :)
console.log(tree);