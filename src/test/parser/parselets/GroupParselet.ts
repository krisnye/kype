import { Expression } from "../../../expressions/Expression";
import { TypeExpression } from "../../../expressions/TypeExpression";
import { Parser } from "../Parser";
import { Token } from "../Token";
import { PrefixOperatorParselet } from "./PrefixOperatorParselet";

export class GroupParselet extends PrefixOperatorParselet {

    closeToken: string;
    canBeEmpty: boolean;

    constructor(close: string, canBeEmpty: boolean) {
        super();
        this.closeToken = close;
        this.canBeEmpty = canBeEmpty;
    }

    parse(p: Parser, open: Token): Expression {
        let value = this.parseArgument(p, open, 0) as Expression;
        let close = p.consume(this.closeToken);
        if (open.source === "{") {
            return new TypeExpression(value);
        }
        else {
            return value;
        }
    }

}