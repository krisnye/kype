import { inferKind } from "../z3/inferKind";
import { createParser } from "./createParser";
import { createTokenizer } from "./tokenizer/createTokenizer";

const parser = createParser();
const tokenizer = createTokenizer();

export function parseExpression(text: string) {
    const tokens = tokenizer.tokenize("test", text);
    parser.setTokens(tokens);
    const expression = parser.parseExpression();
    inferKind(expression);
    return expression;
}
