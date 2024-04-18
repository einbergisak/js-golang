// GoParserBase.js

import antlr4 from 'antlr4'
import GoParser from './GoParser.js'

export default class GoParserBase extends antlr4.Parser {
    constructor(input) {
        super(input);
    }

    /**
     * Returns true if the current Token is a closing bracket (")" or "}")
     */
    closingBracket() {
        const stream = this._input;
        const prevTokenType = stream.LA(1);

        return prevTokenType === GoParser.R_CURLY || prevTokenType === GoParser.R_PAREN;
    }
}
