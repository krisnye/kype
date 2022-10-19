import { Expression } from "../../../expressions/Expression";
import { Parser } from "../Parser";
import { PrefixParselet } from "../PrefixParselet";
import { Token } from "../Token";

export class TerminalParselet extends PrefixParselet {

    factory: (token: Token) => Expression;

    constructor(factory: (value: Token) => Expression) {
        super();
        this.factory = factory;
    }

    parse(p: Parser, token: Token) {
        return this.factory(token);
    }

}