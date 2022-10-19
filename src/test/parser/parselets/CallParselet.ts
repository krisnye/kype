import { CallExpresssion } from "../../../expressions/CallExpression";
import { Expression } from "../../../expressions/Expression";
import { Parser } from "../Parser";
import { Token } from "../Token";
import { tokenTypes } from "../tokenizer/TokenType";
import { BinaryExpressionParselet } from "./BinaryExpressionParselet";
import { GroupParselet } from "./GroupParselet";

export class CallParselet extends BinaryExpressionParselet {

    closeTokenType: keyof typeof tokenTypes;
    groupParselet = new GroupParselet("CloseParen", true);

    constructor(closeToken: keyof typeof tokenTypes) {
        super();
        this.closeTokenType = closeToken;
    }

    parse(p: Parser, callee: Expression, open: Token): Expression {
        let group = this.groupParselet.parse(p, open);
        return new CallExpresssion(
            callee,
            group.split(",")
        );
    }

}