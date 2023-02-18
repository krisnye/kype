import { Parser } from "./Parser";
import { PrefixOperatorParselet } from "./parselets/PrefixOperatorParselet";
import { BinaryExpressionParselet } from "./parselets/BinaryExpressionParselet";
import { MemberParselet } from "./parselets/MemberParselet";
import { TerminalParselet } from "./parselets/TerminalParselet";
import { GroupParselet } from "./parselets/GroupParselet";
// import { CallParselet } from "./parselets/CallParselet";
import { Reference } from "../expressions/Reference";
import { NumberLiteral } from "../expressions/NumberLiteral";
import { DotExpression } from "../expressions/DotExpression";
import { StringLiteral } from "../expressions";

export function createParser() {
    return new Parser({
        Id: new TerminalParselet(({ value }) => {
            switch (value) {
                case "@": return new DotExpression();
                case "POS_INFINITY": return new NumberLiteral(Number.POSITIVE_INFINITY);
                case "NEG_INFINITY": return new NumberLiteral(Number.NEGATIVE_INFINITY);
                default: return new Reference(value);
            }
        }),
        String: new TerminalParselet((token) => new StringLiteral(eval(token.source))),
        Number: new TerminalParselet((token) => new NumberLiteral(eval(token.source))),
        //  interpret integers as bigints
        Integer: new TerminalParselet((token) => new NumberLiteral(eval(`${token.source}n`))),
        Operator: new PrefixOperatorParselet(),
        OpenParen: new GroupParselet("CloseParen", true),
        OpenBracket: new GroupParselet("CloseBracket", true),
        OpenBrace: new GroupParselet("CloseBrace", true),
    },
    {
        Operator: new BinaryExpressionParselet(),
        OpenBracket: new MemberParselet("CloseBracket"),
    })
}