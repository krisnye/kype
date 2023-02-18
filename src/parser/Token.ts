
export class Token {

    readonly type: string;
    readonly source: string;
    readonly value: any;

    constructor(type: string, source: string, value: any = source) {
        this.type = type;
        this.source = source;
        this.value = value;
    }

    toString() {
        return this.source;
    }

    merge(right: Token) {
        return new Token(this.type, this.source + right.source, this.value + right.value);
    }

    toJSON() {
        return { type: this.type, source: this.source };
    }

}
