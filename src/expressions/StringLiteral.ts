
import { ExpressionKind } from "./Expression";
import { Literal } from "./Literal";

export class StringLiteral extends Literal<string> {

    get sortOrder() { return 11; }

    constructor(value: string, source?: unknown) {
        super(value, source);
        this.kind = ExpressionKind.String;
    }

    public compareSortOrderSameType(b: StringLiteral): number {
        return this.value.localeCompare(b.value);
    }

}
