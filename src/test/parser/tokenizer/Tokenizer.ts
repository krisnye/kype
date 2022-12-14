import { Line } from "./Line";
import { Token } from "../Token";
import { TokenType, tokenTypes } from "./TokenType";

export class Tokenizer {

    readonly types: { readonly [type: string]: TokenType };

    constructor(types: { readonly [type: string]: TokenType }) {
        this.types = types;
    }

    tokenize(filename: string, fileSource: string): Token[] {
        let tokens = new Array<Token>();
        let columnIndex = 0;
        let lineIndex = 0;
        let remainingSource = fileSource;
        while (remainingSource.length > 0) {
            for (let type of Object.keys(this.types)) {
                let tokenType = this.types[type];
                let matchLength = tokenType.match(remainingSource);
                if (matchLength > 0) {
                    if (tokenType.previousPredicate && !tokenType.previousPredicate(tokens[tokens.length - 1])) {
                        continue;
                    }
                    let source = remainingSource.slice(0, matchLength);
                    let value = tokenType.value?.(source);
                    let line = lineIndex + 1;
                    let column = columnIndex + 1;
                    let lastToken = tokens[tokens.length - 1];
                    let newToken = new Token(type, source, value);
                    if (tokenType.mergeAdjacent && lastToken?.type === newToken.type) {
                        tokens[tokens.length - 1] = lastToken.merge(newToken);
                    }
                    else {
                        tokens.push(newToken);
                        if (newToken.type === tokenTypes.Eol.name) {
                            lineIndex++;
                            columnIndex = 0;
                        }
                    }
                    columnIndex += matchLength;
                    remainingSource = remainingSource.slice(matchLength);
                    break;
                }
            }
        }
        return tokens;
    }

}