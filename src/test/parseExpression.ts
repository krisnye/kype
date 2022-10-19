import { createParser } from "./parser/createParser";
import { createTokenizer } from "./parser/tokenizer/createTokenizer";

const parser = createParser();
const tokenizer = createTokenizer();

export function parseExpression(text: string) {
    const tokens = tokenizer.tokenize("test", text);
    parser.setTokens(tokens);
    return parser.parseExpression();
}
