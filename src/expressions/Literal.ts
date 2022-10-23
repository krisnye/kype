
import { Expression } from "./Expression";

export class Literal extends Expression {

    get sortOrder() { return 10; }
    readonly value: number;

    constructor(value: number) {
        super();
        this.value = value;
    }

    isNegativeInfinity() {
        return this.value === Number.NEGATIVE_INFINITY;
    }

    isPositiveInfinity() {
        return this.value === Number.POSITIVE_INFINITY;
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
        return this.value.toString();
    }

    static operation(left: Literal, op: string, right: Literal) {
        let value = eval(`(${left.value} ${op} ${right.value})`);
        return new Literal(value);
    }

}
