
import { Expression } from "./Expression";

export class Literal extends Expression {

    get sortOrder() { return 10; }
    readonly value: number;

    constructor(value: number) {
        super();
        this.value = value;
    }

    public compareSortOrderSameType(b: Literal): number {
        return this.value - b.value;
    }

    isLessThan(b: Expression, orEqual = false): boolean | null {
        if (b instanceof Literal) {
            return orEqual ? this.value <= b.value : this.value < b.value;
        }
        return null;
    }

    toStringInternal() {
        return `${this.value}`;
    }

}
