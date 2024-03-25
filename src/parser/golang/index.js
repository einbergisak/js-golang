"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FullGoParser = void 0;
var acorn_1 = require("acorn");
var errors_1 = require("../errors");
var utils_1 = require("../utils");
var FullGoParser = /** @class */ (function () {
    function FullGoParser() {
    }
    FullGoParser.prototype.parse = function (programStr, context, options, throwOnError) {
        try {
            return (0, acorn_1.parse)(programStr, __assign({ sourceType: 'module', ecmaVersion: 'latest', locations: true }, options));
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                error = new errors_1.FatalSyntaxError((0, utils_1.positionToSourceLocation)(error.loc), error.toString());
            }
            if (throwOnError)
                throw error;
            context.errors.push(error);
        }
        return null;
    };
    FullGoParser.prototype.validate = function (_ast, _context, _throwOnError) {
        return true;
    };
    FullGoParser.prototype.toString = function () {
        return 'FullGoParser';
    };
    return FullGoParser;
}());
exports.FullGoParser = FullGoParser;
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
