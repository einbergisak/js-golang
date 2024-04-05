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
 const input = '1+2';
//
const chars = new antlr4.InputStream(input);
const lexer = new GoLexer(chars);
//
lexer.strictMode = false; // do not use js strictMode
//
const tokens = new antlr4.CommonTokenStream(lexer);
const parser = new GoParser(tokens);
const tree = parser.expression();


let wc

let instrs

{
  "type": "expression",
  "children": [
    {
      "type": "expression",
      "children": [
        {
          "type": "primaryExpr",
          "children": [
            {
              "type": "operand",
              "children": [
                {
                  "type": "literal",
                  "children": [
                    {
                      "type": "basicLit",
                      "children": [
                        {
                          "type": "integer",
                          "children": [
                            "1"
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    "+",
    {
      "type": "expression",
      "children": [
        {
          "type": "primaryExpr",
          "children": [
            {
              "type": "operand",
              "children": [
                {
                  "type": "literal",
                  "children": [
                    {
                      "type": "basicLit",
                      "children": [
                        {
                          "type": "integer",
                          "children": [
                            "2"
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

// compile component into instruction array instrs,
// starting at wc (write counter)
const compile = node => {
    compile_comp[tree.ruleNames[node.ruleIndex]](node)
    instrs[wc] = {tag: 'DONE'}
}

// compile program into instruction array instrs,
// after initializing wc and instrs
const compile_program = program => {
    wc = 0
    instrs = []
    compile(program)
}


const compile_comp = {
expression:
    node => {
        if (node.getChildCount() == 3){
            compile(node.getChild(0))
            compile(node.getChild(2))
            instrs[wc++] = {tag: 'BINOP', sym: node.getChild(1).getText()}
        } else if (node.getChildCount() ==2 ) {
            instrs[wc++] = {tag: 'UNOP', sym: node.getChild(0).getText()}
            compile(node.getChild(2))
        }
        else{
        compile(node.getChild(2)}
        }

    },
primaryExpr:
    =>{},
operand:
    =>{},
literal: (comp, ce) => {
		instrs[wc++] = { tag: "LDC", val: comp.val };
	},


}





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

