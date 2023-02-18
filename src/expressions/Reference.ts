
import { Expression, ExpressionKind } from "./Expression";

export class Reference extends Expression {

    get sortOrder() { return 4; }
    readonly name: string;

    constructor(name: string, kind = ExpressionKind.Unknown, source?: unknown) {
        super(source);
        this.name = name;
        this.kind = kind;
    }

    toStringInternal() {
        return `${this.name}`;
    }

}
