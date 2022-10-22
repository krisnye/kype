import { Parser } from "../Parser";
import { getInfixPrecedence, infixRightAssociative } from "../operators";
import { InfixParselet } from "../InfixParslet";
import { BinaryExpression } from "../../../expressions/BinaryExpression";
import { Expression } from "../../../expressions/Expression";
import { Token } from "../Token";
import { MemberExpression } from "../../../expressions/MemberExpression";

export class BinaryExpressionParselet extends InfixParselet {

    protected parseRight(p: Parser, token: Token): Expression {
        let { value } = token;
        let precedence = this.getPrecedence(token);
        if (precedence == null) {
            throw new Error(`Infix operator not found: ${value}`);
        }
        let right = p.parseExpression(precedence + (infixRightAssociative[value] ? -1 : 0));
        return right;
    }

    parse(p: Parser, left: Expression, operator: Token): Expression {
        let right = this.parseRight(p, operator);

        if (operator.source === ".") {
            return new MemberExpression(left, right);
        }
        
        return new BinaryExpression(
            left as Expression,
            operator.value,
            right as Expression,
        );
    }

    getPrecedence(token: Token) {
        return getInfixPrecedence(token.value);
    }

}