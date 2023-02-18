import { Expression } from "../expressions/Expression";
import { InfixParselet } from "./InfixParslet";
import { PrefixParselet } from "./PrefixParselet";
import { Token } from "./Token";
import { tokenTypes } from "./tokenizer/TokenType";

export class Parser {

    private tokens: Token[] = [];
    private prefixParselets: { [key in keyof typeof tokenTypes]?: PrefixParselet };
    private infixParselets: { [key in keyof typeof tokenTypes]?: InfixParselet };
    private parseOutline = true;

    constructor(
        prefixParselets: { [key in keyof typeof tokenTypes]?: PrefixParselet },
        infixParselets: { [key in keyof typeof tokenTypes]?: InfixParselet },
    ) {
        this.prefixParselets = prefixParselets;
        this.infixParselets = infixParselets;
    }

    maybeConsume(tokenType?: string, value?: any): Token | null
    maybeConsume(tokenType?: string[], value?: any): Token | null
    maybeConsume(tokenType?: string | string[], value?: any): Token | null {
        for (let type of Array.isArray(tokenType) ? tokenType : [tokenType]) {
            let result = this.consumeInternal(type, value, false);
            if (result != null) {
                return result;
            }
        }
        return null;
    }

    consume(tokenType?: string, value?: any): Token {
        return this.consumeInternal(tokenType, value, true)!;
    }

    private consumeInternal(tokenType?: string, value?: any, required = true): Token | null {
        let token = this.peek();
        if (token == null) {
            if (required) {
                throw new Error(`Unexpected EOF`)
            }
            else {
                return null;
            }
        }
        if (tokenType != null && token.type !== tokenType) {
            if (required) {
                throw new Error(`Expected: ${tokenType}`)
            }
            else {
                return null;
            }
        }
        if (value !== undefined && token.value !== value) {
            if (required) {
                throw new Error(`Expected: ${value}`)
            }
            else {
                return null;
            }
        }
        this.tokens.pop();
        return token;
    }

    done() {
        return this.tokens.length === 0;
    }

    peek(tokenType?: string, offset = 0): Token | null {
        let token = this.tokens[this.tokens.length - 1 - offset];
        if (token != null && (tokenType == null || tokenType === token.type)) {
            return token;
        }
        return null;
    }

    setTokens(tokens: Token[]): this {
        this.tokens = [...tokens].reverse();
        return this;
    }

    whitespace() {
        let result: Token | undefined = undefined;
        while (true) {
            let whitespace = this.maybeConsume(tokenTypes.Whitespace.name);
            if (whitespace) {
                result = whitespace;
            }
            else {
                break;
            }
        }
        return result;
    }

    parseInlineExpression(precedence: number = 0): Expression {
        let save = this.parseOutline;
        this.parseOutline = false;
        let result = this.parseExpression(precedence);
        this.parseOutline = save;
        return result;
    }

    parseExpression(precedence: number = 0): Expression {
        let token = this.consume();
        this.whitespace();
        let prefix = this.prefixParselets[token.type as keyof typeof tokenTypes];
        if (prefix == null) {
            throw new Error(`Could not parse: ${token.type}(${token.source})`)
        }
        let left = prefix.parse(this, token);

        while (true) {
            this.whitespace();
            let next = this.peek();
            if (next != null) {
                let infix = this.infixParselets[next.type as keyof typeof tokenTypes];
                if (infix != null && precedence < (infix.getPrecedence(next) ?? 0)) {
                    this.consume();
                    this.whitespace();
                    left = infix.parse(this, left, next);
                    continue;
                }
            }
            break;
        }

        return left;
    }

}