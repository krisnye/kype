import { joinExpressions } from "../utility/joinExpressions";
import { BinaryExpression } from "./BinaryExpression";
import { DotExpression } from "./DotExpression";
import { Expression } from "./Expression";
import { MemberExpression } from "./MemberExpression";
import { NumberLiteral } from "./NumberLiteral";
import { Reference } from "./Reference";
import { StringLiteral } from "./StringLiteral";
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

    overlaps(i: Interval<T>) {
        return (this.max > i.min || (this.max === i.min && !this.maxExclusive && !i.minExclusive))
            && (this.min < i.max || (this.min === i.max && !this.minExclusive && !i.maxExclusive));
    }

    combine(i: Interval<T>) {
        let { min, max, minExclusive, maxExclusive } = this;
        if (i.min <= min) {
            minExclusive = i.min < min ? i.minExclusive : minExclusive && i.minExclusive;
            min = i.min;
        }
        if (i.max >= max) {
            maxExclusive = i.max > max ? i.maxExclusive : maxExclusive && i.maxExclusive;
            max = i.max;
        }
        return new Interval<T>(min, max, minExclusive, maxExclusive);
    } 

    get type(): "bigint" | "number" {
        return typeof this.min as "bigint" | "number";
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

    static getIntervalIfOnlyTerm(term: Expression): Interval<bigint | number> | undefined {
        if (term.split("||").length === 1) {
            let remainingTerms: Expression[] = [];
            let interval = Interval.fromAndType(term, remainingTerms);
            if (remainingTerms.length === 0) {
                return interval;
            }
        }
    }

    static fromAndType(type: Expression, remainingTerms?: Expression[]): Interval<number | bigint> {
        if (type instanceof TypeExpression) {
            type = type.proposition;
        }

        let integer = isIntegerType(type);
        let min = new NumberLiteral(integer ? MAX_UNSIGNED_BIGINT : Number.NEGATIVE_INFINITY);
        let max = new NumberLiteral(integer ? MIN_SIGNED_BIGINT : Number.POSITIVE_INFINITY);
        let minExclusive = false;
        let maxExclusive = false;
        type.split("&&").forEach(term => {
            if (isIntegerType(term)) {
                integer = true;
            }
            let used = false;
            if (term instanceof BinaryExpression && term.left instanceof DotExpression && term.right instanceof NumberLiteral) {
                if (term.operator === "==") {
                    min = max = term.right;
                    minExclusive = maxExclusive = false;
                    used = true;
                }
                else if (term.operator.startsWith(">")) {
                    min = term.right;
                    minExclusive = !term.operator.endsWith("=");
                    used = true;
                }
                else if (term.operator.startsWith("<")) {
                    max = term.right;
                    maxExclusive = !term.operator.endsWith("=");
                    used = true;
                }
            }
            if (!used) {
                remainingTerms?.push(term);
            }
        })
        return new Interval(min.value, max.value, minExclusive, maxExclusive);
    }

    static fromOrType(type: Expression): Interval<number | bigint>[] {
        if (type instanceof TypeExpression) {
            type = type.proposition;
        }

        return type.split("||").map(option => Interval.fromAndType(option));
    }

}

const MAX_UNSIGNED_BIGINT = 0xFFFFFFFFFFFFFFFFn;
const MIN_SIGNED_BIGINT = - 0xFFFFFFFFFFFFFFFEn;

function isIntegerType(term: Expression) {
    let integer = false;
    term.split("&&").forEach(term => {
        if (term instanceof BinaryExpression
        && term.left instanceof MemberExpression
        && term.left.object instanceof DotExpression
        && term.left.property instanceof Reference
        && term.left.property.name === "class"
        && term.right instanceof StringLiteral
        && term.right.value === "Integer") {
            integer = true;
        }
    })
    return integer;
}