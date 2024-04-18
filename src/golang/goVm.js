import GoLexer from "./goParsing/GoLexer.js";
import GoParser from "./goParsing/GoParser.js";
import antlr4 from 'antlr4';
import Channel from "./channel.js";
//import GoParserListener from './GoParserListener.js';
//Insert here testcase

let parser
function parse(input){
let chars = new antlr4.InputStream(input);
let lexer = new GoLexer(chars);
//
lexer.strictMode = false;
//
let tokens = new antlr4.CommonTokenStream(lexer);
parser = new GoParser(tokens);
let tree = parser.sourceFile();
return(tree)
}

const push = (array, ...items) => {
  array.splice(array.length, 0, ...items)
  return array
}
const lookup = (x, e) => {


  if (is_null(e)) {
    error('unbound name:', x)
  }


  if (head(e).hasOwnProperty(x)) {
    const v = head(e)[x]
    if (is_unassigned(v))
      error('unassigned name: ', cmd.sym)
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
const tail = (x) => x[1]  // TODO: x[1] instead?

const extend = (xs, vs, e) => {


  if (vs.length > xs.length) error('too many arguments')
  if (vs.length < xs.length) error('too few arguments')
  const new_frame = {}
  for (let i = 0; i < xs.length; i++)
    new_frame[xs[i]] = vs[i]


  return [new_frame, e]
}
const peek = array => array.slice(-1)[0]
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

const builtin_mapping = {
  print: console.log,
  make: createChannel,
}

const apply_builtin = (builtin_symbol, args) =>
  builtin_mapping[builtin_symbol](...args)

const buitinsToGlobalFrame = () =>{
  for (const key in builtin_mapping)
    global_frame[key] = {
      tag: 'BUILTIN',
      sym: key,
      arity: builtin_mapping[key].length
  }
}

const apply_binop = (routine, op, v2, v1) => binop_microcode[op](v1, v2, routine)

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

  '+': (x, y) => (is_number(x) && is_number(y)) ||
    (is_string(x) && is_string(y))
    ? x + y
    : error("+ expects two numbers" +
      " or two strings, got", typeof (y)),

  '*': (x, y) => x * y,
  '&&': (x, y) => x && y,
  "||": (x, y) => x || y,
  '-': (x, y) => x - y,
  '/': (x, y) => x / y,
  '%': (x, y) => x % y,
  '<': (x, y) => x < y,
  '<=': (x, y) => x <= y,
  '>=': (x, y) => x >= y,
  '>': (x, y) => x > y,
  '==': (x, y) => x === y,
  '!==': (x, y) => x !== y,
  '<-': (x, y, routine) =>  x.send(routine, y)
}


const unop_microcode = {
  '-': x => - x,
  '!': x => is_boolean(x)
    ? !x
    : error(x, '! expects boolean, found:'),
  '<-': (x, routine) => x.receive(routine)
}

const apply_unop = (routine, op, v) => unop_microcode[op](v, routine)


function getRuleName(node) {
  return parser.ruleNames[node?.ruleIndex]
}

function findChild(node, ruleName) {
  if (getRuleName(node) == ruleName) {
    return node
  } else if (node.children) {
    for (let i = 0; i < node.getChildCount(); i++) {
      let c = findChild(node.getChild(i), ruleName)
      if (c != null) {
        return c
      }
    }
  }
  return null
}


// EXTRACT DECLARATION NAMES
function scan(node) {
  const names = [];

  function traverse(node) {
    if (getRuleName(node) == "identifierList" || getRuleName(node) == "typeName") {
      //console.log("FOUND IDENTIFIER: "+node.getChild(0))
      names.push(node.getChild(0).getText())
    } else if (getRuleName(node) == "functionDecl") {
      names.push(node.getChild(1).getText())
    } else if (node.children) {
      node.children.forEach(child => { if (getRuleName(child) != "block") { traverse(child) } });
    }
    // console.log("TRAVERSING, RULE NAME WAS "+getRuleName(node))

  }
  traverse(node);
  return names;
}

let wc

let instrs

const IGNOREABLE = new Set(["typeLit", "expressionStmt", "operand", "literal", "statement", "simpleStmt", "expressionList", "declaration"])

const compile_comp = {
  "null": node => null,
  "undefined": node => undefined,
  packageClause:
    node => {
      null
    },
  sourceFile:
    node => {
      const locals = scan(node)
      instrs[wc++] = { tag: 'ENTER_SCOPE', syms: locals } // global env for sourcefile
      for (let i = 0; i < node.getChildCount(); i++) {
        compile(node.getChild(i))
      }
      // TODO: RUN MAIN FUNCTIONS
      instrs[wc++] = { tag: "LD", sym: "main" }
      instrs[wc++] = { tag: 'CALL', arity: 0 }

    },
  expression:
    node => {
      if (node.getChildCount() == 3) {
        compile(node.getChild(0))
        compile(node.getChild(2))
        instrs[wc++] = { tag: 'BINOP', sym: node.getChild(1).getText() }
      } else if (node.getChildCount() == 2) {
        compile(node.getChild(1))
        instrs[wc++] = { tag: 'UNOP', sym: node.getChild(0).getText() }
      }
      else {
        compile(node.getChild(0))
      }
    },
  channelType:
    node => {
      instrs[wc++] = { tag: "LDC", val: findChild(node, "typeName").getChild(0).getText() }
    },
  sendStmt: //Send over channel
    node => { // compile as expression instead, will be treated as binary operation
      compile_comp['expression'](node)
    },
  
    primaryExpr:
    node => {
      
      let methodName = node.getChild(0).getChild(2)
      //   console.log(operand.getChild(1).getText())
      
      if (methodName != null && (["Lock", "Unlock"].includes(methodName.getText()))) {
        let mutexName = findChild(node, "operandName").getText()
        methodName.getText() == "Lock" ? instrs[wc++] = { tag: 'LOCK', var: mutexName } : instrs[wc++] = { tag: 'UNLOCK', var: mutexName }
        instrs[wc++] = { tag: "LDC", val: undefined }
      }
      else if (methodName != null && (["Done", "Add", "Wait"]).includes(methodName.getText())) {
        let waitName = findChild(node, "operandName").getText()
        //compile(node.getChild(0))
        if (methodName.getText() == "Add") {
          compile(node.getChild(1).getChild(1)) // Argument
          instrs[wc++] = { tag: "WG_ADD", var: waitName}
        }
        else {
          methodName.getText() == "Wait" ? instrs[wc++] = { tag: 'WG_WAIT', var: waitName } : instrs[wc++] = { tag: 'WG_DONE', var: waitName }
        }
        instrs[wc++] = { tag: "LDC", val: undefined }
      }
      else if (getRuleName(node.getChild(1)) == "arguments") {
        compile(node.getChild(0))
        let expressionList = node.getChild(1).getChild(1)
        for (let i = 0; i < expressionList.getChildCount(); i++) {
          compile(expressionList.getChild(i))
        }
        instrs[wc++] = { tag: 'CALL', arity: expressionList.getChildCount() < 2 ? expressionList.getChildCount() : expressionList.getChildCount() - 1 }
      }
      else {
        compile(node.getChild(0))

      }

    },
  basicLit:
    node => {
      //EVERYTHING NOT A STRING OR BOOLEAN IS A NUMBER
      if (getRuleName(node.getChild(0)) == "string_") {
        instrs[wc++] = { tag: "LDC", val: node.getChild(0).getText() }
      }
      else { instrs[wc++] = { tag: "LDC", val: Number(node.getChild(0).getText()) } }
    },
  operandName:
    node => {
      if (node.getChild(0).getText() == "true") {
        instrs[wc++] = { tag: "LDC", val: true }
      }
      else if (node.getChild(0).getText() == "false") {
        instrs[wc++] = { tag: "LDC", val: false }
      }
      else {
        instrs[wc++] = { tag: "LD", sym: node.getChild(0).getText() }
      }
    },
  ifStmt:
    node => {
      let pred = node.getChild(1);
      let cons = node.getChild(2);
      let alt = node.getChild(4);
      compile(pred)
      const jump_on_false_instruction = { tag: 'JOF' }
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

      const loop_start = wc
      let condition = node.getChild(1)
      let body = node.getChild(2)
      compile(condition)
      const jump_on_false_instruction = { tag: 'JOF' }
      instrs[wc++] = jump_on_false_instruction
      compile(body)
      instrs[wc++] = { tag: 'GOTO', addr: loop_start }
      jump_on_false_instruction.addr = wc
    },
  block:
    node => {
      const locals = scan(node)
      instrs[wc++] = { tag: 'ENTER_SCOPE', syms: locals }
      compile(node.getChild(1))
      instrs[wc++] = { tag: 'EXIT_SCOPE' }
    },
  statementList:
    node => {
      if (node.getChildCount === 0)
        return instrs[wc++] = { tag: "LDC", val: undefined } // TODO: required?
      for (let i = 0; i < node.getChildCount(); i++) {
        compile(node.getChild(i));

        getRuleName(node.getChild(i)) != "eos" ? instrs[wc++] = { tag: 'POP' }: null
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
  shortVarDecl:
    node => {
      compile_comp['varSpec'](node)
    },
  varSpec:
    node => {
      let identifierList = node.getChild(0)
      let symsList = []
      for (let i = 0; i < identifierList.getChildCount(); i++) {
        if (identifierList.getChild(i).getText() == ",") { continue }
        symsList.push(identifierList.getChild(i).getText())
      }
      let valuesIndex = 2
      if (getRuleName(node.getChild(1)) == "type_") {
        valuesIndex = 3
        let type = node.getChild(1)

        if (getRuleName(type.getChild(0).getChild(0)) == "qualifiedIdent") {
          let qualifiedIdent = type.getChild(0).getChild(0)
          if (qualifiedIdent.getChild(2) == "WaitGroup") {
            instrs[wc++] = { tag: 'LDC', val: 0 }
            instrs[wc++] = { tag: 'ASSIGN', sym: symsList[0] }
          }
          else if (qualifiedIdent.getChild(2) == "Mutex") {
            instrs[wc++] = { tag: 'LDC', val: false }
            instrs[wc++] = { tag: 'ASSIGN', sym: symsList[0] }
          }
        }

      }
      else {
        let values = node.getChild(valuesIndex)
        for (let i = 0; i < values.getChildCount(); i++) {
          if (values.getChild(i).getText() == ",") { continue }
          compile(values.getChild(i))
          instrs[wc++] = { tag: 'ASSIGN', sym: symsList.shift() }
        }
      }
    },
  assignment:
    node => {
      compile(node.getChild(2))
      instrs[wc++] = { tag: 'ASSIGN', sym: node.getChild(0).getChild(0).getText() }
      instrs[wc++] = { tag: "LDC", val: undefined}
    },

  functionDecl:
    node => {
      const sym = node.getChild(1).getText()
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
      instrs[wc++] = { tag: 'LDF', prms: parameters, addr: wc + 1 };
      const goto_instruction = { tag: 'GOTO' }
      instrs[wc++] = goto_instruction
      const block = node.children.find(child => getRuleName(child) === "block") //TODO change to "block" idk
      compile(block)
      instrs[wc++] = { tag: 'LDC', val: undefined }
      instrs[wc++] = { tag: 'RESET' }
      goto_instruction.addr = wc;
      instrs[wc++] = { tag: 'ASSIGN', sym: sym }
    },


  returnStmt:
    node => {
      compile(node.getChild(1))
      instrs[wc++] = { tag: 'RESET' }
    },
  eos:
    node => {
      null
    },

  goStmt:
    node => {
      instrs[wc++] = { tag: 'GOSTMT' }

      let primaryExpr = node.getChild(1).getChild(0)
      compile(primaryExpr.getChild(0))
      let expressionList = primaryExpr.getChild(1).getChild(1)
      for (let i = 0; i < expressionList.getChildCount(); i++) {
        compile(expressionList.getChild(i))
      }
      instrs[wc++] = { tag: 'GOCALL', arity: expressionList.getChildCount() < 2 ? expressionList.getChildCount() : expressionList.getChildCount() - 1 }
      instrs[wc++] = { tag: 'LDC', val: undefined }

    },

}


// compile component into instruction array instrs,
// starting at wc (write counter)
const compile = node => {
  let ruleName = getRuleName(node)
  if (IGNOREABLE.has(ruleName)) {
    node.getChild(0).getText() === "(" ? compile(node.getChild(1)): compile(node.getChild(0))
  } else {
    let f = compile_comp[getRuleName(node)]
    if (typeof f != "function")
      console.log("NOT A FUNCTION: ", getRuleName(node))
    f(node)
    instrs[wc] = { tag: 'DONE' }
  }
}

// compile program into instruction array instrs,
// after initializing wc and instrs
const compile_program = program => {
  wc = 0
  instrs = []
  compile(program)
}

const microcode = {
  LDC:
    (instr, routine) => {
      routine.PC++
      push(routine.OS, instr.val);
    },
  UNOP:
    (instr, routine) => {
      routine.PC++
      push(routine.OS, apply_unop(routine, instr.sym, routine.OS.pop()))
    },
  BINOP:
    (instr, routine) => {
      routine.PC++
      push(routine.OS, apply_binop(routine, instr.sym, routine.OS.pop(), routine.OS.pop()))
    },
  POP:
    (instr, routine) => {
      routine.PC++
      routine.OS.pop()
    },
  JOF:
    (instr, routine) => {
      routine.PC = routine.OS.pop() ? routine.PC + 1 : instr.addr
    },
  GOTO:
    (instr, routine) => {
      routine.PC = instr.addr
    },
  ENTER_SCOPE:
    (instr, routine) => {
      routine.PC++
      push(routine.RTS, { tag: 'BLOCK_FRAME', env: routine.E })
      const locals = instr.syms
      const unassigneds = locals.map(_ => unassigned)
      routine.E = extend(locals, unassigneds, routine.E)
    },
  EXIT_SCOPE:
    (instr, routine) => {
      routine.PC++
      routine.E = routine.RTS.pop().env
    },
  LD:
    (instr, routine) => {
      routine.PC++
      push(routine.OS, lookup(instr.sym, routine.E))
    },
  ASSIGN:
    (instr, routine) => {
      routine.PC++
      assign_value(instr.sym, peek(routine.OS), routine.E)
    },
  LDF:
    (instr, routine) => {
      routine.PC++
      push(routine.OS, {
        tag: 'FUNCTION', prms: instr.prms,
        addr: instr.addr, env: routine.E
      })
    },
  CALL:
    (instr, routine) => {
      const arity = instr.arity
      let args = []
      for (let i = arity - 1; i >= 0; i--)
        args[i] = routine.OS.pop()
      const sf = routine.OS.pop()
      if (sf.tag === 'BUILTIN') {
        routine.PC++
        return push(routine.OS, apply_builtin(sf.sym, args))
      }
      push(routine.RTS, { tag: 'CALL_FRAME', addr: routine.PC + 1, env: routine.E })
      routine.E = extend(sf.prms, args, sf.env)
      routine.PC = sf.addr
    },
  GOSTMT:
    (instr, routine) => {
      let newRoutine = new Routine(routine.OS.slice(), routine.PC + 1, routine.E, routine.RTS.slice(), instrs)
      routines.push(newRoutine)
      while (instrs[routine.PC].tag != "GOCALL") {
        routine.PC++
      }
      routine.PC++
    },
  GOCALL:
    (instr, routine) => {

      const arity = instr.arity
      let args = []
      for (let i = arity - 1; i >= 0; i--)
        args[i] = routine.OS.pop()
      const sf = routine.OS.pop()

      if (sf.tag === 'BUILTIN') {
        routine.PC++
        return push(routine.OS, apply_builtin(sf.sym, args))
      }
      push(routine.RTS, { tag: 'CALL_FRAME', addr: instrs.length - 1, env: routine.E })
      routine.E = extend(sf.prms, args, sf.env)
      routine.PC = sf.addr
    },
  LOCK:
    (instr, routine) => {

      lookup(instr.var, routine.E) ? routine.instrCounter = INSTRUCTION_ALLOWANCE : (assign_value(instr.var, true, routine.E), routine.PC++)
    },
  UNLOCK:
    (instr, routine) => {
      routine.PC++
      assign_value(instr.var, false, routine.E)
    },
  WG_ADD: (instr, routine) => {
    routine.PC++
    let waitGroupCount = lookup(instr.var, routine.E)
    let val = routine.OS.pop()
    waitGroupCount += val
    assign_value(instr.var, waitGroupCount, routine.E)
  },
  WG_DONE: (instr, routine) => {
    routine.PC++
    let waitGroupCount = lookup(instr.var, routine.E)
    waitGroupCount -= 1
    assign_value(instr.var, waitGroupCount, routine.E)
  },
  WG_WAIT: (instr, routine) => {
    let waitGroupCount = lookup(instr.var, routine.E)
    if (waitGroupCount == 0) {
      routine.PC++
    } else {
      routine.instrCounter = INSTRUCTION_ALLOWANCE // set to max to suspend
    }
  },
  RESET:
    (instr, routine) => {
      // keep popping...
      const top_frame = routine.RTS.pop()
      if (top_frame.tag === 'CALL_FRAME') {
        // ...until top frame is a call frame
        routine.PC = top_frame.addr
        routine.E = top_frame.env
      }
    },
}







class Routine {
  constructor(OS, PC, E, RTS, instrs) {
    this.OS = OS
    this.PC = PC
    this.E = E
    this.RTS = RTS
    this.runAfter = Date.now();
    this.instrCounter = 0

    //console.log("NEW ROUTINE STARTED::: " + this.instrs[this.PC].tag)
    //console.log(this.instrs[this.PC])
    //this.runUntil = Date.now();

  }

  runRoutine() {
    //this.runUntil = Date.now() + SWITCH_TIME
    this.instrCounter = 0
    while (instrs[this.PC].tag != "DONE" && this.instrCounter < INSTRUCTION_ALLOWANCE) {
      const instr = instrs[this.PC]
      //console.log(instr)
      microcode[instr.tag](instr, this)
      this.instrCounter++

    }
    if (instrs[this.PC].tag == "DONE") {
      let delIndex = routines.indexOf(this);
      if (delIndex > -1) {
        routines.splice(delIndex, 1);
        //console.log("END OF ROUTINE::: " + peek(this.OS))
      }
    }

  }

}



function run() {
  const main = new Routine([], 0, global_environment, [], instrs)
  routines.push(main)
  let index = 0
  while (routines.length > 0) {
    routines[index].runRoutine()
    index = (index + 1) % routines.length
    //console.log(routines)
    //console.log(index)
  }
}

function createChannel(type) {
  return new Channel()
}


// only for debugging purposes

// const jsonTree = parseTreeToJSON(tree, parser);
// console.log(JSON.stringify(jsonTree, null, 2));

// function parseTreeToJSON(tree, parser) {
//   if (tree.getChildCount() === 0) {
//     return tree.getText();

//   }

//   const node = {};
//   const ruleName = getRuleName(tree);
//   node.ruleName = ruleName;
//   node.children = [];

//   for (let i = 0; i < tree.getChildCount(); i++) {
//     const child = tree.getChild(i);
//     node.children.push(parseTreeToJSON(child, parser));
//   }

//   return node;
// }

let global_frame
let routines
let empty_environment
let global_environment
const INSTRUCTION_ALLOWANCE = 2

function parseAndRun(input){
  
  routines =[]
  global_frame = {}
  empty_environment = null
  global_environment = [global_frame, empty_environment]
  buitinsToGlobalFrame()

  compile_program(parse(input))
  //console.log(instrs)
  run()
}

function test(testcase, expected_output){
  console.log("\n**** INPUT ****\n")
  console.log(testcase)
  console.log("\n**** EXPECTED OUTPUT  ****\n")
  console.log(expected_output)
  console.log("\n**** ACTUAL OUTPUT ****\n")
  parseAndRun(testcase)
  console.log("\n______________________________")
}

test(
  `package main
  func main(){
    print("Hello World")
  }`, 
'Hello World')

test(
  `package main
  func add(a int, b int) int {
    return a + b;
  }
  func main() {
    print(add(5, 3));
  }`,
  8
)

test(
  `package main

  var myMutex sync.Mutex
  var myWg sync.WaitGroup

  func startFrom(x int) int {
    y:= 0
    for (y < 10){
      print(x + y)
      y = y + 1
      if (x + y == 22 || x + y == 32){
        myMutex.Lock()
      }
    }
    myMutex.Unlock()
    myWg.Done()
     
  }

  func main() {
    go startFrom(0)
    go startFrom(10)
    go startFrom(20)
    go startFrom(30)
    myWg.Add(2)
    print("near beginning")
    myWg.Wait()
    print("after two finished")
  }`,
  "complicated"
)

test(
  `package main
  var myMutex sync.Mutex
  func main(){
    myMutex.Lock()
    myMutex.Unlock()
    print("Hello World")
  }`, 
'Hello World')

