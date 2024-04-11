import GoLexer from "./GoLexer.js";
import GoParser from "./GoParser.js";
import antlr4 from 'antlr4';
import GoParserListener from './GoParserListener.js';
import GoParserVisitor from "./GoParserVisitor.js";
let content = "public class SampleClass { void DoSomething(){} }";
//let myLexer = GoLexer(CharStreams.fromString(content));
// let tokens = new CommonTokenStream(myLexer);
// let myParser = GoParser(tokens);
// let tree = myParser.compilationUnit();


// const antlr4 = require('antlr4');
// const ECMAScriptLexer = require('./GoLexer.js');
// const ECMAScriptParser = require('./lib/ECMAScriptParser.js');
//
const input = '1+2';
const input2 = `
package main
func greet(arg1 string, arg2 int) {
    var age int = 30
    surname := "bob"
}
`

const getRuleName = (node) => parser.ruleNames[node.ruleIndex]

//
const chars = new antlr4.InputStream(input2);
const lexer = new GoLexer(chars);
//
lexer.strictMode = false; // do not use js strictMode
//
const tokens = new antlr4.CommonTokenStream(lexer);
const parser = new GoParser(tokens);
const tree = parser.sourceFile();
function extractStringsWithinDeclarations(node) {
    const stringsWithinDeclarations = [];

    function traverse(node) {
        if (getRuleName(node) === "identifierList") {
            console.log("AFQWFWEFWEFWEFEWF")
            stringsWithinDeclarations.push(node.getChild(0))
            // If the node is a declaration, search for strings within it

        } else if (node.children) {
            // Otherwise, continue traversing
            node.children.forEach(child => traverse(child));
        }
    }

    traverse(node);
    return stringsWithinDeclarations;
}
const scan = node =>
    getRuleName(node) != 'statement'
        ? node.children.reduce((acc, x) => acc.concat(scan(x)),
            [])
        : getRuleName(node) == "identifierList"
            ? [node.getChild(0)]
            : []

// Define your own visitor by extending the generated visitor.
class ParseTreeDisplayVisitor extends GoParserVisitor {
    constructor() {
        super();
        // Initialize indentation level
        this.indentation = 0;
    }

    // Override visitTerminal to handle terminal nodes
    visitTerminal(node) {
        // Print node's text with proper indentation
        console.log(' '.repeat(this.indentation / 2) + node.symbol.text);
    }

    // Override visitChildren to handle non-terminal nodes
    visitChildren(node) {
        if (!node || node.children === null) {
            return;
        }


        // Increase indentation before visiting children
        if (!parser.ruleNames[node.ruleIndex] == "expression" && !parser.ruleNames[node.ruleIndex] === "statement") {
            console.log(" ".repeat(this.indentation * 2) + "(" + parser.ruleNames[node.ruleIndex])
        }
        if (parser.ruleNames[node.ruleIndex] == "block") {
            var x = scan(node)
            console.log("PPIPOIIOPIPO " + x.toString())
        }
        this.indentation++;
        var b = false
        if (parser.ruleNames[node.ruleIndex] == "functionDecl") {
            b = true
            // console.log("ASDASDASD " + node.children.length)
        }
        // Visit each child node
        for (let child of node.children) {

            if (b) {
                console.log("CHILD: " + parser.ruleNames[child.ruleIndex])
            }
            child.accept(this);
        }


        // Decrease indentation after visiting children
        this.indentation--;
        // if (!parser.ruleNames[node.ruleIndex] == "expression" && !parser.ruleNames[node.ruleIndex] == "statement") {
        //     console.log(" ".repeat(this.indentation * 2) + ")")
        // }



    }

    // Override default visit methods for each rule if necessary

    // For example:
    // visitRuleName(ctx) {
    //     // Handle the specific rule here
    //     this.visitChildren(ctx);
    // }
}



const visitor = new ParseTreeDisplayVisitor();
tree.accept(visitor)

// console.log(tree.toStringTree(parser.ruleNames))
let wc

let instrs


// compile component into instruction array instrs,
// starting at wc (write counter)
const compile = node => {
    compile_comp[tree.ruleNames[node.ruleIndex]](node)
    instrs[wc] = { tag: 'DONE' }
}

// compile program into instruction array instrs,
// after initializing wc and instrs
const compile_program = program => {
    wc = 0
    instrs = []
    compile(program)
}





// }





//function parseTreeToJSON(tree, parser) {
//    if (tree.getChildCount() === 0) {
//        return tree.getText();
//    }
//
//    const node = {};
//    const ruleName = parser.ruleNames[tree.ruleIndex];
//    node.type = ruleName;
//    node.children = [];
//
//    for (let i = 0; i < tree.getChildCount(); i++) {
//        const child = tree.getChild(i);
//        node.children.push(parseTreeToJSON(child, parser));
//    }
//
//    return node;
//}
//
//const jsonTree = parseTreeToJSON(tree, parser);
//console.log(JSON.stringify(jsonTree, null, 2));

