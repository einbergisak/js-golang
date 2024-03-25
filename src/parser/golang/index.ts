import { parse } from 'acorn'
import { Program } from 'estree'
import { GoLexer } from './GoLexer.js';
import { GoParser } from './GoParser.js';
import { CharStream, CommonTokenStream } from 'antlr4';
import { Context } from '../..'
import { FatalSyntaxError } from '../errors'
import { AcornOptions, Parser } from '../types'
import { positionToSourceLocation } from '../utils'

export class FullGoParser implements Parser<AcornOptions> {

parse(
    programStr: string,
    context: Context,
    options?: Partial<AcornOptions>,
    throwOnError?: boolean
  ): Program | null {
    try {
      return goParse(programStr) as unknown as Program
    } catch (error) {
      if (error instanceof SyntaxError) {
        error = new FatalSyntaxError(positionToSourceLocation((error as any).loc), error.toString())
      }

      if (throwOnError) throw error
      context.errors.push(error)
    }

    return null
  }

  validate(_ast: Program, _context: Context, _throwOnError: boolean): boolean {
    return true
  }

  toString(): string {
    return 'FullGoParser'
  }
}

function goParse(programStr, {
                         sourceType: 'module',
                         ecmaVersion: 'latest',
                         locations: true,
                         ...options
                       }){


const input = "if (3 != 2) {val x := 3;} else {val y := 2;};"
const chars = new CharStream(input); // replace this with a FileStream as required
const lexer = new GoLexer(chars);
const tokens = new CommonTokenStream(lexer);
const parser = new GoParser(tokens);
const tree = parser.expression();
return tree.toStringTree(parser.ruleNames);

}