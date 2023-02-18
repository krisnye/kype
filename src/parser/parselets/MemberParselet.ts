import { Parser } from "../Parser";
import { tokenTypes } from "../tokenizer/TokenType";
import { BinaryExpressionParselet } from "./BinaryExpressionParselet";
import { Expression } from "../../expressions/Expression";
import { Token } from "../Token";
import { MemberExpression } from "../../expressions/MemberExpression";

export class MemberParselet extends BinaryExpressionParselet {

    closeTokenType: string & keyof typeof tokenTypes;

    constructor(closeToken: string & keyof typeof tokenTypes) {
        super();
        this.closeTokenType = closeToken;
    }

    parse(p: Parser, object: Expression, open: Token): Expression {
        p.whitespace();
        let hasProperty = !p.peek(this.closeTokenType);
        let property = hasProperty ? p.parseExpression(0) : null;
        //  if it's computed we consume the closing operator "]" otherwise
        //  otherwise this is just implicitly closed by the property
        let close = p.consume(this.closeTokenType);
        // don't even create Members, just convert to a get property?
        return new MemberExpression(
            object,
            property!,
        );
    }

}