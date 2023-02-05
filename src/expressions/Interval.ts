import { joinExpressions } from "../utility/joinExpressions";
import { BinaryExpression } from "./BinaryExpression";
import { DotExpression } from "./DotExpression";
import { Expression } from "./Expression";
import { NumberLiteral } from "./NumberLiteral";
import { TypeExpression } from "./TypeExpression";

export function isFloatInterval(value: any): value is Interval<number> {
    return typeof value?.min === "number";
}

export function isIntegerInterval(value: any): value is Interval<number> {
    return typeof value?.min === "bigint";
}

export class Interval<T extends number | bigint> extends Expression {

    get sortOrder() { return -10; }
    min: T;
    max: T;
    minExclusive: boolean;
    maxExclusive: boolean;

    constructor(min: T, max: T, minExclusive = false, maxExclusive = false) {
        super();
        this.min = min;
        this.max = max;
        this.minExclusive = minExclusive && min !== Number.NEGATIVE_INFINITY;
        this.maxExclusive = maxExclusive && max !== Number.POSITIVE_INFINITY;

        // normalize if this is integer based interval to always be inclusive of outer ranges.
        if (isIntegerInterval(this)) {
            if (this.minExclusive) {
                this.min++;
                this.minExclusive = false;
            }
            if (this.maxExclusive) {
                this.max--;
                this.maxExclusive = false;
            }
        }
    }

    toStringInternal() {
        return `{${this.minExclusive ? `>` : ``}${this.min} .. ${this.maxExclusive ? `<` : ``}${this.max}}`;
    }

    toType(): TypeExpression {
        let expressions: Expression[] = [];
        if (this.min !== Number.NEGATIVE_INFINITY) {
            expressions.push(new BinaryExpression(new DotExpression(), this.minExclusive ? ">" : ">=", new NumberLiteral(this.min)));
        }
        if (this.max !== Number.POSITIVE_INFINITY) {
            expressions.push(new BinaryExpression(new DotExpression(), this.maxExclusive ? "<" : "<=", new NumberLiteral(this.max)));
        }
        if (expressions.length === 0) {
            expressions.push(new BinaryExpression(new DotExpression(), "<=", new NumberLiteral(Number.POSITIVE_INFINITY)));
        }
        return new TypeExpression(joinExpressions(expressions, "&&"));
    }

    static fromType(type: Expression): Interval<number | bigint>[] {
        if (type instanceof TypeExpression) {
            type = type.proposition;
        }
        return type.split("||").map(option => {
            let min = new NumberLiteral(Number.NEGATIVE_INFINITY);
            let max = new NumberLiteral(Number.POSITIVE_INFINITY);
            let minExclusive = false;
            let maxExclusive = false;
            option.split("&&").forEach(term => {
                if (term instanceof BinaryExpression && term.left instanceof DotExpression && term.right instanceof NumberLiteral) {
                    if (term.operator === "==") {
                        min = max = term.right;
                        minExclusive = maxExclusive = false;
                    }
                    else if (term.operator.startsWith(">")) {
                        min = term.right;
                        minExclusive = !term.operator.endsWith("=");
                    }
                    else if (term.operator.startsWith("<")) {
                        max = term.right;
                        maxExclusive = !term.operator.endsWith("=");
                    }
                }
            })
            return new Interval(min.value, max.value, minExclusive, maxExclusive);
        });
    }

}