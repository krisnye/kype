import { Parser } from "./Parser";
import { Expression } from "../../expressions/Expression";
import { Token } from "./Token";

export abstract class PrefixParselet {

    abstract parse(p: Parser, token: Token): Expression

}