import { parse } from 'acorn'
import { Program } from 'estree'

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
      return parse(programStr, {
        sourceType: 'module',
        ecmaVersion: 'latest',
        locations: true,
        ...options
      }) as unknown as Program
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
// import { GoLexer } from './GoLexer.js';
// import { GoParser } from './GoParser.js';
// import { CharStream, CommonTokenStream } from 'antlr4';
//
//
// const input = "if (3 != 2) {val x := 3;} else {val y := 2;};"
// const chars = new CharStream(input); // replace this with a FileStream as required
// const lexer = new GoLexer(chars);
// const tokens = new CommonTokenStream(lexer);
// const parser = new GoParser(tokens);
// const tree = parser.expression();
// console.log(tree.toStringTree);