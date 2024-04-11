import  GoLexer from "./GoLexer.js";
import GoParser from "./GoParser.js";
import antlr4 from 'antlr4';
//import GoParserListener from './GoParserListener.js';
 const input = '1+2';
 const input3 = `package main
 func main() {
    var z = 0
        var y = 5 + 3 / 4
  }
   `
 const input2 = `
package main
func main() {
  var x = true
  "string"
  hi(4, 2)
}

`
//

const chars = new antlr4.InputStream(input3);
const lexer = new GoLexer(chars);
//
lexer.strictMode = false;
//
const tokens = new antlr4.CommonTokenStream(lexer);
const parser = new GoParser(tokens);
const tree = parser.sourceFile();

const push = (array, ...items) => {
  array.splice(array.length, 0, ...items)
  return array
}
const lookup = (x, e) => {
  if (is_null(e)) {
    error('unbound name:', x)
    sys.ex
  }

  console.log("E IS ::::::",e)
  if (head(e).hasOwnProperty(x)) {
      const v = head(e)[x]
      if (is_unassigned(v))
          error('unassigned name: ',  cmd.sym)
      return v
  }
  return lookup(x, tail(e))
}
function error(message, ...args) {
  const errorMessage = args.length > 0 ? `${message}: ${args.join(', ')}` : message;
  throw new Error(errorMessage);
}

const is_null = (x) => x == null || x == undefined || head(x) == null
const head = (x) => x[0]
const tail = (x) => x.length > 1 ? x.slice(1) : x[1]  // TODO: x[1] instead?
const extend = (xs, vs, e) => {
  if (vs.length > xs.length) error('too many arguments')
  if (vs.length < xs.length) error('too few arguments')
  const new_frame = {}
  for (let i = 0; i < xs.length; i++)
      new_frame[xs[i]] = vs[i]
  return [new_frame, e]
}
const peek = array =>
    array.slice(-1)[0]
const unassigned = { tag: 'unassigned' }

const is_unassigned = v => {
  return v !== null &&
  typeof v === "object" &&
  v.hasOwnProperty('tag') &&
  v.tag === 'unassigned'
}
const assign_value = (x, v, e) => {
  if (is_null(e))
      error('unbound name:', x)
  if (head(e).hasOwnProperty(x)) {
      head(e)[x] = v
  } else {
      assign_value(x, v, tail(e))
  }
}

const apply_binop = (op, v2, v1) => binop_microcode[op](v1, v2)

function is_number(value) {
  return typeof value === 'number';
}
function is_string(value) {
  return typeof value === 'string'
}

function is_boolean(value) {
  return typeof value === 'boolean'
}


const binop_microcode = {

  '+': (x, y)   => (is_number(x) && is_number(y)) ||
                   (is_string(x) && is_string(y))
                   ? x + y
                   : error( "+ expects two numbers" +
                                  " or two strings, got", typeof(y)),

  '*':   (x, y) => x * y,
  '-':   (x, y) => x - y,
  '/':   (x, y) => x / y,
  '%':   (x, y) => x % y,
  '<':   (x, y) => x < y,
  '<=':  (x, y) => x <= y,
  '>=':  (x, y) => x >= y,
  '>':   (x, y) => x > y,
  '==': (x, y) => x === y,
  '!==': (x, y) => x !== y
}


const unop_microcode = {
  '-': x => - x,
  '!'     : x => is_boolean(x)
                 ? ! x
                 : error(x, '! expects boolean, found:')
}

const apply_unop = (op, v) => unop_microcode[op](v)

let wc

let instrs

const IGNOREABLE = new Set( ["expressionStmt", "operand", "literal", "statement", "simpleStmt", "expressionList", "declaration"])

function getRuleName (node){
  return parser.ruleNames[node?.ruleIndex]
}

// EXTRACT DECLARATION NAMES
function scan(node) {
  const names = [];

  function traverse(node) {
      if (getRuleName(node) == "identifierList" || getRuleName(node) == "typeName"   ) {
          //console.log("FOUND IDENTIFIER: "+node.getChild(0))
          names.push(node.getChild(0).getText())
      } else if (node.children) {
          node.children.forEach(child => {if (getRuleName(child) != "block") { traverse(child)}});
      }
     // console.log("TRAVERSING, RULE NAME WAS "+getRuleName(node))

  }
  traverse(node);
  return names;
}


const compile_comp = {
"null": node => null,
"undefined": node => undefined,
packageClause:
  node =>{
    null
},
sourceFile:
    node => {
      for (let i = 0; i < node.getChildCount(); i++) {
        compile(node.getChild(i))

      }
      // TODO: RUN MAIN FUNCTIONS
    //   instrs[wc++] = { tag: "LD", sym: "main"}
    //  instrs[wc++] = {tag: 'CALL', arity: 0}

        },
expression:
    node => {
        if (node.getChildCount() == 3){
            compile(node.getChild(0))
            compile(node.getChild(2))
            instrs[wc++] = {tag: 'BINOP', sym: node.getChild(1).getText()}
        } else if (node.getChildCount() ==2 ) {
            compile(node.getChild(1))
            instrs[wc++] = {tag: 'UNOP', sym: node.getChild(0).getText()}
        }
        else{
            compile(node.getChild(0))
        }
    },
primaryExpr:
    node =>{
      if (getRuleName(node.getChild(1)) == "arguments"){
        compile(node.getChild(0))
        let expressionList = node.getChild(1).getChild(1)
        for (let i = 0; i < expressionList.getChildCount(); i++) {
          compile(expressionList.getChild(i))
        }
        instrs[wc++] = {tag: 'CALL', arity: expressionList.getChildCount() == 0? 0 : expressionList.getChildCount() -1}
      }
      else{
        compile(node.getChild(0))
      }

    },
basicLit:
    node => {
      //EVERYTHING NOT A STRING OR BOOLEAN IS A NUMBER
      if (getRuleName(node.getChild(0)) == "string_"){
        instrs[wc++] = { tag: "LDC", val: node.getChild(0).getText() }
      }  
    else {instrs[wc++] = { tag: "LDC", val: Number(node.getChild(0).getText())}}
    },
operandName:
    node => {
        if (node.getChild(0).getText() == "true"){
          instrs[wc++] = { tag: "LDC", val: true }
        }
        else if (node.getChild(0).getText() == "false"){
          instrs[wc++] = { tag: "LDC", val: false }
        }
        else{
          instrs[wc++] = { tag: "LD", sym: node.getChild(0).getText() }
        }
    },
ifStmt:
    node => {
      let pred = node.getChild(1);
      let cons = node.getChild(2);
      let alt = node.getChild(4)
      compile(pred)
      const jump_on_false_instruction = {tag: 'JOF'}
      instrs[wc++] = jump_on_false_instruction
      compile(cons)
      const goto_instruction = { tag: 'GOTO' }
      instrs[wc++] = goto_instruction;
      const alternative_address = wc;
      jump_on_false_instruction.addr = alternative_address;
      compile(alt)
      goto_instruction.addr = wc
    },
forStmt:
  node => {
    let condition = node.getChild(1)
    let body = node.getChild(2)
    compile(condition)
    const loop_start = wc
    const jump_on_false_instruction = {tag: 'JOF'}
    instrs[wc++] = jump_on_false_instruction
    compile(body)
    instrs[wc++] = {tag: 'GOTO', addr: loop_start}
    jump_on_false_instruction.addr = wc
  },
block:
  node => {
      const locals = scan(node)
      instrs[wc++] = {tag: 'ENTER_SCOPE', syms: locals}
      compile(node.getChild(1))
      instrs[wc++] = {tag: 'EXIT_SCOPE'}
  },
statementList:
  node => {
    let first = true
    for (let i = 0; i < node.getChildCount(); i++) {
      first ? first = false
              : (getRuleName(node.getChild(i)) != "eos" ? instrs[wc++] = {tag: 'POP'}: null)
      compile(node.getChild(i));
    }
},
varDecl:
  node => {
      compile(node.getChild(1));
    },
identifierList:
node => {
  null
},
varSpec:
    node => {
      let identifierList = node.getChild(0)
      let symsList = []
      for (let i = 0; i < identifierList.getChildCount(); i++) {
        if (identifierList.getChild(i).getText() == ",") {continue}
        symsList.push(identifierList.getChild(i).getText())
      }
      let values = node.getChild(2)
      for (let i = 0; i < values.getChildCount(); i++) {
        if (values.getChild(i).getText() == ","){continue}
        compile(values.getChild(i))
        instrs[wc++] = {tag: 'ASSIGN', sym: symsList.shift()}
      }
    },


functionDecl:
    node => {
      const sym = node.getChild(1)
      const parameters = []
      const signature = node.children.find(child => getRuleName(child) === "signature")
      const paramsNode = signature.children.find(child => getRuleName(child) === "parameters")

      if (paramsNode) {
          for (let i = 0; i < paramsNode.children.length; i++) {
              const paramDecl = paramsNode.children[i]
              if (getRuleName(paramDecl) === "parameterDecl") {
                  const identifierList = paramDecl.children.find(child => getRuleName(child) === "identifierList")
                  //const typeName = paramDecl.children.find(child => parser.ruleNames[child.ruleIndex] === "type_").children[0].children[0]
                  const paramName = identifierList.children[0]
                  parameters.push(paramName.getText()/*{ name: paramName, type: typeName }*/) // TODO: Do we need the type? ig if we're implementing type che
              }
          }
      }
      instrs[wc++] = {tag: 'LDF', prms: parameters, addr: wc + 1};
      const goto_instruction = {tag: 'GOTO'}
      //instrs[wc++] = goto_instruction
      const block = node.children.find(child => getRuleName(child) === "block")
      compile(block)
      instrs[wc++] = {tag: 'LDC', val: undefined}
      instrs[wc++] = {tag: 'RESET'}
      goto_instruction.addr = wc;
      },


returnStmt:
      node => {
        compile(node.getChild(0))
        instrs[wc++] = {tag: 'RESET'}
      },
eos:
    node => {
     null
    },

}


// compile component into instruction array instrs,
// starting at wc (write counter)
const compile = node => {
  let ruleName = getRuleName(node)
  //console.log("RULE NAME IS: ", ruleName)
  if (IGNOREABLE.has(ruleName)){
    compile(node.getChild(0))
  } else{
    let f = compile_comp[getRuleName(node)]
    f(node)
    instrs[wc] = {tag: 'DONE'}
  }
}

// compile program into instruction array instrs,
// after initializing wc and instrs
const compile_program = program => {
  wc = 0
  instrs = []
  compile(program)
}

let OS
let PC
let E
let RTS

const microcode = {
LDC:
    instr => {
        PC++
        push(OS, instr.val);
    },
UNOP:
    instr => {
        PC++
        push(OS, apply_unop(instr.sym, OS.pop()))
    },
BINOP:
    instr => {
        PC++
        console.log(instr.sym)
        push(OS, apply_binop(instr.sym, OS.pop(), OS.pop()))
    },
POP:
    instr => {
        PC++
        OS.pop()
    },
JOF:
    instr => {
        PC = OS.pop() ? PC + 1 : instr.addr
    },
GOTO:
    instr => {
        PC = instr.addr
    },
ENTER_SCOPE:
    instr => {
        PC++
        push(RTS, {tag: 'BLOCK_FRAME', env: E})
        const locals = instr.syms
        const unassigneds = locals.map(_ => unassigned)
        E = extend(locals, unassigneds, E)
    },
EXIT_SCOPE:
    instr => {
        PC++
        E = RTS.pop().env
    },
LD:
    instr => {
        PC++
        push(OS, lookup(instr.sym, E))
    },
ASSIGN:
    instr => {
        PC++
        assign_value(instr.sym, peek(OS), E)
    },
LDF:
    instr => {
        PC++
        push(OS, {tag: 'CLOSURE', prms: instr.prms,
                   addr: instr.addr, env: E})
    },
CALL:
    instr => {
        const arity = instr.arity
        let args = []
        for (let i = arity - 1; i >= 0; i--)
            args[i] = OS.pop()
        const sf = OS.pop()
        if (sf.tag === 'BUILTIN') {
            PC++
            return push(OS, apply_builtin(sf.sym, args))
        }
        push(RTS, {tag: 'CALL_FRAME', addr: PC + 1, env: E})
        E = extend(sf.prms, args, sf.env)
        PC = sf.addr
    },
TAIL_CALL:
    instr => {
        const arity = instr.arity
        let args = []
        for (let i = arity - 1; i >= 0; i--)
            args[i] = OS.pop()
        const sf = OS.pop()
        if (sf.tag === 'BUILTIN') {
            PC++
            return push(OS, apply_builtin(sf.sym, args))
        }
        // dont push on RTS here
        E = extend(sf.prms, args, sf.env)
        PC = sf.addr
    },
RESET :
    instr => {
        // keep popping...
        const top_frame = RTS.pop()
        if (top_frame.tag === 'CALL_FRAME') {
            // ...until top frame is a call frame
            PC = top_frame.addr
            E = top_frame.env
        }
    }
}


compile_program(tree)
const global_frame = {}
const empty_environment = null
const global_environment =[global_frame, empty_environment]

console.log(run())// compile_program(tree)
console.log(instrs)
function run() {
    OS = []
    PC = 0
    E = global_environment
    RTS = []

    while (instrs[PC].tag != "DONE") {//display("next instruction: ")
        //print_code([instrs[PC]])
        //display(PC, "PC: ")
        //print_OS("\noperands:            ");
        //print_RTS("\nRTS:            "); ");
        //print_RTS("\nRTS:            ");
        const instr = instrs[PC]
        console.log("INSTRUMCTION IS :::: "+instr.tag)
        microcode[instr.tag](instr)
      }
    return peek(OS)
}

class Routine{
    constructor(OS, PC, E RTS, instrs)
}








