import { Expression } from "./Expression";

export class DotExpression extends Expression {

    get sortOrder() { return -1; }

    constructor() {
        super();
    }

    public compareSortOrderSameType(b: DotExpression): number {
        return 0;
    }

    toStringInternal() {
        return `@`;
    }

}
