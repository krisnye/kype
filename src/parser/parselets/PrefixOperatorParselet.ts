import { Parser } from "../Parser";
import { prefixPrecedence } from "../operators";
import { UnaryExpression } from "../../expressions/UnaryExpression";
import { Expression } from "../../expressions/Expression";
import { Token } from "../Token";
import { PrefixParselet } from "../PrefixParselet";
import { NumberLiteral } from "../../expressions/NumberLiteral";

export class PrefixOperatorParselet extends PrefixParselet {

    protected getPrecedence(token: Token) {
        return prefixPrecedence[token.value];
    }

    protected parseArgument(p: Parser, token: Token, precedence = this.getPrecedence(token)): Expression {
        if (precedence == null) {
            let { value } = token;
            throw new Error(`Prefix operator not found: ${value}`);
        }
        let argument = p.parseExpression(precedence);
        return argument;
    }

    parse(p: Parser, operator: Token): Expression {
        let argument = this.parseArgument(p, operator);
        if (argument instanceof NumberLiteral) {
            if (operator.value === "+") {
                return argument;
            }
            if (operator.value === "-") {
                return new NumberLiteral( - argument.value);
            }
        }
        return new UnaryExpression(
            operator.value,
            argument as Expression,
        )
    }

}