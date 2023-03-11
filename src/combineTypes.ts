import { BinaryOperator, NumberLiteral } from "./expressions";
import { BinaryExpression } from "./expressions/BinaryExpression";
import { Expression } from "./expressions/Expression";
import { Interval, isFloatInterval } from "./expressions/Interval";
import { TypeExpression } from "./expressions/TypeExpression";
import { simplify } from "./simplify";
import { joinExpressions } from "./utility/joinExpressions";

function sign(a: number | bigint) {
    return a < 0 ? -1 : a > 0 ? +1 : 0;
}

function abs(a: number | bigint) {
    return a < 0 ? -a : a;
}

function max(a: number | bigint, b: number | bigint) {
    return a > b ? a : b;
}

function min(a: number | bigint, b: number | bigint) {
    return a < b ? a : b;
}

function trunc<T extends number | bigint>(a: T) {
    if (typeof a === "number") {
        a = Math.trunc(a) as T;
    }
    return a;
}

function isInteger(a: number | bigint) {
    return a === trunc(a);
}

function negate(a: number | bigint) {
    return ((typeof a === "bigint" ? -1n : -1.0) as any) * (a as any);
}

function zero<T extends number | bigint>(a: T) {
    return typeof a === "bigint" ? 0n : 0.0;
}

function one<T extends number | bigint>(a: T) {
    return typeof a === "bigint" ? 1n : 1.0;
}

export function invertInterval(i: Interval<number>): Interval<number>[] {
    if (i.isUnconstrainedFloat()) {
        return [i];
    }
    let minSign = sign(i.min);
    let maxSign = sign(i.max);
    let sameSign = minSign === maxSign;
    let hasZero = !sameSign;
    if (hasZero) {
        return [
            new Interval(Number.NEGATIVE_INFINITY, 1.0 / i.min, false, i.minExclusive),
            new Interval(1.0 / i.max, Number.POSITIVE_INFINITY, i.maxExclusive, false),
        ];
    }
    else {
        return [new Interval(1 / i.max, 1 / i.min, i.maxExclusive, i.minExclusive)];
    }
}

function isInfinite<T extends number | bigint>(value: T) {
    return typeof value === "number" && !Number.isFinite(value);
}

function combineIntervals<T extends number | bigint>(a: Interval<T>, b: Interval<T>, operation: (a: T, b: T) => T) {
    //  we track all possible edge values and whether or not they are exclusive
    let values: [T, boolean][] = []
    let push = (a: T, b: T, exclusive: boolean) => {
        values.push([operation(a, b), exclusive]);
    }
    push(a.min, b.min, a.minExclusive || b.minExclusive);
    push(a.min, b.max, a.minExclusive || b.maxExclusive);
    push(a.max, b.min, a.maxExclusive || b.minExclusive);
    push(a.max, b.max, a.maxExclusive || b.maxExclusive);

    //  we also use incrementally lower values, WHY?
    let c0 = trunc((b.min as any) + (one(b.min) as any) as T);
    let c1 = trunc((b.max as any) - (one(b.max) as any) as T);

    if (c0 > b.min && c0 < b.max) {
        push(a.min, c0, b.minExclusive || b.maxExclusive);
        push(a.max, c0, b.minExclusive || b.maxExclusive);
    }
    if (c1 > b.min && c1 > b.min) {
        push(a.min, c1, a.minExclusive || a.maxExclusive);
        push(a.max, c1, a.minExclusive || a.maxExclusive);
    }

    //  then we loop and find the min/max values along with whether or not they are exclusive
    let min = values[0];
    let max = values[0];
    for (let i = 1; i < values.length; i++) {
        let value = values[i];
        if (value[0] < min[0] || value[0] === min[0] && !value[1]) {
            min = value;
        }
        if (value[0] > max[0] || value[0] === max[0] && !value[1]) {
            max = value;
        }
    }
    //  finally create the new interval with correct values and exclusivity
    return new Interval(min[0], max[0], min[1], max[1]).toType();
}

function multiplyIntervals<T extends number | bigint>(a: Interval<T>, b: Interval<T>) {
    return combineIntervals<T>(a, b, (a, b) => {
        // fixes for Number.POSITIVE_INFINITY * 0.0 = NaN
        const result = a === 0.0
            ? Math.sign(b as number) * 0.0 as T
            : b === 0.0
            ? Math.sign(a as number) * 0.0 as T
            : a * b as T;
        return result;
    });
}

function exponentIntervals<T extends number | bigint>(a: Interval<T>, b: Interval<T>) {
    return combineIntervals<T>(a, b, (a, b) => a ** b as T);
}

function divideIntervals<T extends number | bigint>(a: Interval<T>, b: Interval<T>) {
    return combineIntervals<T>(a, b, (a, b) => {
        return a / b as T;
    });
}

export function combineTypes(left: TypeExpression, operator: BinaryOperator, right: TypeExpression): TypeExpression {
    switch (operator) {
        case "&&":
        case "||":
            return new TypeExpression(
                simplify(new BinaryExpression(left.proposition, operator, right.proposition))
            );
        case "+":
            return simplify(
                foreachIntervalPair<number>(left, right, (a, b) => {
                    return new Interval(a.min + b.min, a.max + b.max, a.minExclusive || b.minExclusive, a.maxExclusive || b.maxExclusive).toType();
                })
            ) as TypeExpression;
        case "-":
            return simplify(
                foreachIntervalPair<number>(left, right, (a, b) => {
                    return new Interval(a.min - b.max, a.max - b.min, a.minExclusive || b.minExclusive, a.maxExclusive || b.maxExclusive).toType();
                })
            ) as TypeExpression;
        case "*":
            const name = `${left} ${operator} ${right}`;
            const DEBUG = name === "{(@ > 0.0)} * {(@ < 0.0)}";
            return simplify(
                foreachIntervalPair(left, right, multiplyIntervals)
            ) as TypeExpression;
        case "**":
            return simplify(
                foreachIntervalPair(left, right, exponentIntervals)
            ) as TypeExpression;
        case "%":
            return simplify(
                foreachIntervalPair(left, right, (a, b) => {
                    const maxValue = max(abs(b.min), abs(b.max));
                    const maxExclusive = true;
                    const zero = typeof maxValue === "bigint" ? 0n : 0.0;
                    const minValue = a.min < zero ? negate(maxValue) : zero;
                    const minExclusive = a.min < zero;
                    return new Interval(minValue, maxValue, minExclusive, maxExclusive).toType();
                })
            ) as TypeExpression;
        case "/":
            return simplify(
                foreachIntervalPair(left, right, (a, b) => {
                    if (isFloatInterval(b)) {
                        return joinExpressions(invertInterval(b).map(ib => {
                            const result = multiplyIntervals(a, ib as Interval<number>);
                            return result;
                        }), "||");
                    }
                    else {
                        return divideIntervals(a, b);
                    }
                })
            ) as TypeExpression;
        default:
            throw new Error(`Could not combine types: ${left} ${operator} ${right}`);
    }
}

function foreachIntervalPair<T extends number | bigint>(a: TypeExpression, b: TypeExpression, callback: (a: Interval<T>, b: Interval<T>) => Expression | null): Expression {
    // console.log({ a: a.toString(), b: b.toString(), aInteger: })
    return foreachSplitRejoin(joinExpressions(Interval.fromOrType(a), "||"), joinExpressions(Interval.fromOrType(b), "||"), "||", (a, b) => {
        return callback(a as Interval<T>, b as Interval<T>);
    })
}

function foreachSplitRejoin(a: Expression, b: Expression, operator: BinaryOperator, callback: (a: Expression, b: Expression) => Expression | null): Expression {
    return joinExpressions(foreachProduct(a.split(operator), b.split(operator), callback), operator);
}

function foreachProduct<A,B,C>(arrayA: A[], arrayB: B[], callback: (a: A, b: B) => C | null): C[] {
    let results: C[] = [];
    for (let a of arrayA) {
        for (let b of arrayB) {
            let result = callback(a, b);
            if (result != null) {
                results.push(result);
            }
        }
    }
    return results;
}