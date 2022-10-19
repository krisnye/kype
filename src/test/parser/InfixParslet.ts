import { Expression } from "../../expressions/Expression";
import { Parser } from "./Parser";
import { Token } from "./Token";

export abstract class InfixParselet {

    abstract parse(p: Parser, left: Expression, token: Token): Expression
    abstract getPrecedence(token: Token): number | undefined;

}