import { joinExpressions } from "../utility/joinExpressions";
import { BinaryExpression } from "./BinaryExpression";
import { DotExpression } from "./DotExpression";
import { Expression } from "./Expression";
import { Literal } from "./Literal";
import { NumberLiteral } from "./NumberLiteral";
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

    isUnconstrainedFloat() {
        return !this.minExclusive && !this.maxExclusive && this.min === Number.NEGATIVE_INFINITY && this.max === Number.POSITIVE_INFINITY;
    }

    isEmpty() {
        return this.min > this.max || this.min === this.max && (this.minExclusive || this.maxExclusive);
    }

    contains(i: T): boolean {
        return (this.max > i || (this.max === i && !this.maxExclusive))
            && (this.min < i || (this.min === i && !this.minExclusive));

    }

    overlapsOrAdjacentIfInteger(i: Interval<T>) {
        const isInteger = i.type === "bigint";
        if (isInteger) {
            return (this.max > i.min || ((this.max + (1n as any)) >= i.min && !this.maxExclusive && !i.minExclusive))
                && (this.min < i.max || ((this.min - (1n as any)) <= i.max && !this.minExclusive && !i.maxExclusive));
        }
        else {
            return (this.max > i.min || (this.max === i.min && !this.maxExclusive && !i.minExclusive))
                && (this.min < i.max || (this.min === i.max && !this.minExclusive && !i.maxExclusive));
        }
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
        return `{${this.minExclusive ? `>` : ``}${Literal.toString(this.min)} .. ${this.maxExclusive ? `<` : ``}${Literal.toString(this.max)}}`;
    }

    toTerms(): Expression[] {
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
        return expressions;
    }

    toType(): TypeExpression {
        const expressions = this.toTerms();
        return new TypeExpression(joinExpressions(expressions, "&&"));
    }

    excludeValue(this: Interval<T>, value: T): Interval<T>[] {
        let interval = this;
        if (value === this.min && !this.minExclusive) {
            interval = new Interval<T>(this.min, this.max, true, this.maxExclusive);
        }
        if (value === this.max && !this.maxExclusive) {
            interval = new Interval<T>(this.min, this.max, this.minExclusive, true);
        }
        if (value > interval.min && value < interval.max) {
            let intervals = [];
            let lower = new Interval<T>(this.min, value, this.minExclusive, true);
            let upper = new Interval<T>(value, this.max, true, this.maxExclusive);
            if (!lower.isEmpty()) {
                intervals.push(lower);
            }
            if (!upper.isEmpty()) {
                intervals.push(upper);
            }
            return intervals;
        }
        return [interval];
    }

    static fromAndTypeWithRemaining(type: Expression): [Interval<number | bigint>[], Expression[]] {
        let remainingTerms: Expression[] = [];
        if (type instanceof TypeExpression) {
            type = type.proposition;
        }
        const terms = type.split("&&");
        let intervals = this.fromAndTerms(terms, remainingTerms);
        return [intervals, remainingTerms];
    }

    static fromAndType(type: Expression, remainingTerms = new Array<Expression>()): Interval<number | bigint>[] {
        if (type instanceof TypeExpression) {
            type = type.proposition;
        }

        const terms = type.split("&&");
        return this.fromAndTerms(terms, remainingTerms, true);
    }

    static fromAndTerms(allTerms: Expression[]): Interval<number | bigint>[]
    static fromAndTerms(allTerms: Expression[], remainingTerms: Expression[]): Interval<number | bigint>[]
    static fromAndTerms(allTerms: Expression[], remainingTerms: Expression[], returnIfEmpty: true): Interval<number | bigint>[]
    static fromAndTerms(allTerms: Expression[], remainingTerms?: Expression[], returnIfEmpty = false): Interval<number | bigint>[] {
        if (!remainingTerms) {
            remainingTerms = [];
        }
        let interval = this.fromAndTermsInternal(allTerms, remainingTerms, returnIfEmpty);
        let intervals: Interval<number | bigint>[] = interval ? [interval] : [];
        for (let i = remainingTerms.length - 1; i >= 0; i--) {
            let term = remainingTerms[i];
            if (term instanceof BinaryExpression && term.left instanceof DotExpression && term.operator === "!=" && term.right instanceof NumberLiteral) {
                const value = term.right.value;
                // remove it from the remainingTerms.
                remainingTerms.splice(i, 1);
                //  found a != value
                //  split any intervals it intersects.
                intervals = intervals.map(interval => {
                    return interval.excludeValue(value);
                }).flat();
            }
        }
        return intervals;
    }
    static fromAndTermsInternal(allTerms: Expression[], remainingTerms?: Expression[], returnIfEmpty = false): Interval<number | bigint> | null {
        let integer = allTerms.some(isIntegerType);
        let min = new NumberLiteral(integer ? MIN_SIGNED_BIGINT : Number.NEGATIVE_INFINITY);
        let max = new NumberLiteral(integer ? MAX_UNSIGNED_BIGINT : Number.POSITIVE_INFINITY);
        let minExclusive = false;
        let maxExclusive = false;
        // console.log("-------------------------->  " + allTerms.join(","));
        // if (allTerms.join(",") === "(@ <= -1),(@ >= 0),(@ <= 3)") {
        //     debugger;
        // }
        allTerms.forEach(term => {
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
                    let exclusive = !term.operator.endsWith("=");;
                    if (term.right.value > min.value || term.right.value === min.value && exclusive) {
                        min = term.right;
                        minExclusive = exclusive
                    }
                    used = true;
                }
                else if (term.operator.startsWith("<")) {
                    let exclusive = !term.operator.endsWith("=");
                    // console.log({
                    //     max_value: max.value,
                    //     term_right_value: term.right.value,
                    //     exclusive,
                    //     shouldReplace: term.right.value < max.value || term.right.value === max.value && exclusive,
                    // });
                    if (term.right.value < max.value || term.right.value === max.value && exclusive) {
                        max = term.right;
                        maxExclusive = exclusive;
                    }
                    used = true;
                }
            }
            if (!used) {
                remainingTerms?.push(term);
            }
        })
        if (!returnIfEmpty && remainingTerms?.length === allTerms.length) {
            // we didn't use any terms so we don't return the interval.
            return null;
        }
        return new Interval(min.value, max.value, minExclusive, maxExclusive);
    }

    static fromOrType(type: Expression): Interval<number | bigint>[] {
        if (type instanceof TypeExpression) {
            type = type.proposition;
        }

        return type.split("||").map(option => Interval.fromAndType(option)).flat();
    }

}

const MAX_UNSIGNED_BIGINT = 0xFFFFFFFFFFFFFFFFn;
const MIN_SIGNED_BIGINT = - 0xFFFFFFFFFFFFFFFEn;

function isIntegerType(term: Expression) {
    let integer = false;
    if (term instanceof BinaryExpression
    // && term.left instanceof MemberExpression
    // && term.left.object instanceof DotExpression
    // && term.left.property instanceof Reference
    // && term.left.property.name === "class"
    && term.right instanceof StringLiteral
    && term.right.value === "Integer") {
        integer = true;
    }
    return integer;
}