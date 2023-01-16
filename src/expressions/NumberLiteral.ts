
import { Expression } from "./Expression";
import { Literal } from "./Literal";

export class NumberLiteral extends Literal<number> {

    get sortOrder() { return 10; }

    isNegativeInfinity() {
        return this.value === Number.NEGATIVE_INFINITY;
    }

    isPositiveInfinity() {
        return this.value === Number.POSITIVE_INFINITY;
    }

    public compareSortOrderSameType(b: NumberLiteral): number {
        return this.value - b.value;
    }

    isLessThan(b: Expression, orEqual = false): boolean | null {
        if (b instanceof NumberLiteral) {
            return orEqual ? this.value <= b.value : this.value < b.value;
        }
        return null;
    }

    toStringInternal() {
        return this.value.toString();
    }

    static operation(left: NumberLiteral, op: string, right: NumberLiteral) {
        let value = eval(`(${left.value} ${op} ${right.value})`);
        return new NumberLiteral(value);
    }

}
