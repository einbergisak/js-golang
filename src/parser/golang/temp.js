import GoLexer from "./GoLexer.js";
import GoParser from "./GoParser.js";
import antlr4 from 'antlr4';
//import GoParserListener from './GoParserListener.js';

const input = `
package main
func main() {
    z := make(chan int)
    var y = 5 + 3 / 4
    func asd(x int) {
      return x * 2
    }
    return asd(y)
  }

`
//xs
const chars = new antlr4.InputStream(input);
const lexer = new GoLexer(chars);
//
lexer.strictMode = false; // do not use js strictMode
//
const tokens = new antlr4.CommonTokenStream(lexer);
const parser = new GoParser(tokens);
const tree = parser.sourceFile();


function parseTreeToJSON(tree, parser) {
    if (tree.getChildCount() === 0) {
        return tree.getText();

    }

    const node = {};
    const ruleName = parser.ruleNames[tree.ruleIndex];
    node.type = ruleName;
    node.children = [];

    for (let i = 0; i < tree.getChildCount(); i++) {
        const child = tree.getChild(i);
        node.children.push(parseTreeToJSON(child, parser));
    }

    return node;
}

// if (node.type === "functionDecl") {
//     const parameters = []
//     const signature = node.children.find(child => child.type === "signature")
//     const paramsNode = signature.children.find(child => child.type === "parameters")

//     if (paramsNode) {
//         for (let i = 0; i < paramsNode.children.length; i++) {
//             const paramDecl = paramsNode.children[i]
//             if (paramDecl.type === "parameterDecl") {
//                 const identifierList = paramDecl.children.find(child => child.type === "identifierList")
//                 const typeName = paramDecl.children.find(child => child.type === "type_").children[0].children[0]
//                 const paramName = identifierList.children[0]
//                 parameters.push({ name: paramName, type: typeName })
//             }
//         }
//     }
// }

const jsonTree = parseTreeToJSON(tree, parser);
console.log(JSON.stringify(jsonTree, null, 2));