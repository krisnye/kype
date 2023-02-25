import { Expression } from "./Expression";

export class CustomExpression extends Expression {

    get sortOrder() { return -5; }

    public get isTerminal() { return true };

    public compareSortOrderSameType(b: CustomExpression): number {
        return this.toString().localeCompare(b.toString());
    }

    toStringInternal() {
        return `[${this.source}]`;
    }

}
