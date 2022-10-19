import { Parser } from "./Parser";
import { PrefixOperatorParselet } from "./parselets/PrefixOperatorParselet";
import { BinaryExpressionParselet } from "./parselets/BinaryExpressionParselet";
import { MemberParselet } from "./parselets/MemberParselet";
import { TerminalParselet } from "./parselets/TerminalParselet";
import { GroupParselet } from "./parselets/GroupParselet";
import { CallParselet } from "./parselets/CallParselet";
import { Reference } from "../../expressions/Reference";
import { Literal } from "../../expressions/Literal";

export function createParser() {
    return new Parser({
        Id: new TerminalParselet((token) => new Reference(token.source)),
        Number: new TerminalParselet((token) => new Literal(eval(token.source))),
        Integer: new TerminalParselet((token) => new Literal(eval(token.source))),
        Operator: new PrefixOperatorParselet(),
        OpenParen: new GroupParselet("CloseParen", true),
        OpenBracket: new GroupParselet("CloseBracket", true),
        OpenBrace: new GroupParselet("CloseBrace", true),
    },
    {
        Operator: new BinaryExpressionParselet(),
        OpenParen: new CallParselet("CloseParen"),
        OpenBracket: new MemberParselet("CloseBracket"),
    })
}