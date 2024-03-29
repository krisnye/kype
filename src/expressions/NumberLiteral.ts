
import { Expression, ExpressionKind } from "./Expression";
import { Literal } from "./Literal";

type IntegerLiteral = NumberLiteral & { value: bigint };
type FloatLiteral = NumberLiteral & { value: bigint };

export function isIntegerLiteral(e: any): e is IntegerLiteral {
    return e instanceof NumberLiteral && typeof e.value === "bigint";
}

export function isFloatLiteral(e: any): e is FloatLiteral {
    return e instanceof NumberLiteral && typeof e.value === "bigint";
}

export class NumberLiteral extends Literal<number | bigint> {

    get sortOrder() { return 10; }

    constructor(value: number | bigint, source?: unknown) {
        super(value, source);
        this.kind = typeof value === "number" ? ExpressionKind.Float : ExpressionKind.Integer;
    }

    isNegativeInfinity() {
        return this.value === Number.NEGATIVE_INFINITY;
    }

    isPositiveInfinity() {
        return this.value === Number.POSITIVE_INFINITY;
    }

    public compareSortOrderSameType(b: NumberLiteral): number {
        return this.value < b.value ? -1 : this.value > b.value ? +1 : 0;
    }

    isLessThan(b: Expression, orEqual = false): boolean | null {
        if (b instanceof NumberLiteral) {
            return orEqual ? this.value <= b.value : this.value < b.value;
        }
        return null;
    }

    static operation(left: NumberLiteral, op: string, right: NumberLiteral) {
        let value = eval(`(${left.value} ${op} ${right.value})`);
        if (value === true) {
            value = 1n;
        }
        else if (value === false) {
            value = 0n;
        }
        return new NumberLiteral(value);
    }

}
