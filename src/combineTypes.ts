import { BinaryExpression } from "./expressions/BinaryExpression";
import { LogicalOperator, MathOperator } from "./expressions/BinaryOperator";
import { Expression } from "./expressions/Expression";
import { Interval } from "./expressions/Interval";
import { TypeExpression } from "./expressions/TypeExpression";
import { simplify } from "./simplify";
import { joinExpressions } from "./utility/joinExpressions";

// function invertType(type: TypeExpression): TypeExpression {
//     return new TypeExpression(joinExpressions(type.proposition.split("||").map(term => Interval.fromType(term)).flat(), "||"));
// }

export function invertInterval(i: Interval): Interval[] {
    let sameSign = Math.sign(i.min) === Math.sign(i.max);
    let hasZero = !sameSign;
    if (hasZero) {
        return [
            new Interval(Number.NEGATIVE_INFINITY, 1 / i.min),
            new Interval(1 / i.max, Number.POSITIVE_INFINITY),
        ];
    }
    else {
        return [new Interval(1 / i.max, 1 / i.min)];
    }
}

function multiplyIntervals(a: Interval, b: Interval) {
    //  we track all possible edge values and whether or not they are exclusive
    let values: [number, boolean][] = [
        [a.min * b.min, a.minExclusive || b.minExclusive],
        [a.min * b.max, a.minExclusive || b.maxExclusive],
        [a.max * b.min, a.maxExclusive || b.minExclusive],
        [a.max * b.max, a.maxExclusive || b.maxExclusive],
    ];
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

export function combineTypes(left: TypeExpression, operator: string, right: TypeExpression) {
    switch (operator) {
        case LogicalOperator.and:
        case LogicalOperator.or:
            return new TypeExpression(
                simplify(new BinaryExpression(left.proposition, operator, right.proposition))
            );
        case MathOperator.addition:
            return simplify(
                foreachIntervalPair(left, right, (a, b) => {
                    return new Interval(a.min + b.min, a.max + b.max, a.minExclusive || b.minExclusive, a.maxExclusive || b.maxExclusive).toType();
                })
            )
        case MathOperator.subtraction:
            return simplify(
                foreachIntervalPair(left, right, (a, b) => {
                    return new Interval(a.min - b.max, a.max - b.min, a.minExclusive || b.minExclusive, a.maxExclusive || b.maxExclusive).toType();
                })
            )
        case MathOperator.multiplication:
            return simplify(
                foreachIntervalPair(left, right, multiplyIntervals)
            )
        case MathOperator.division:
            return simplify(
                foreachIntervalPair(left, right, (a, b) => {
                    return joinExpressions(invertInterval(b).map(ib => {
                        return multiplyIntervals(a, ib as Interval);
                    }), "||");
                })
            );
        default:
            throw new Error(`Could not combine types: ${left} ${operator} ${right}`);
    }
}

function foreachIntervalPair(a: TypeExpression, b: TypeExpression, callback: (a: Interval, b: Interval) => Expression | null): Expression {
    return foreachSplitRejoin(joinExpressions(Interval.fromType(a), "||"), joinExpressions(Interval.fromType(b), "||"), "||", (a, b) => {
        return callback(a as Interval, b as Interval);
    })
}

function foreachSplitRejoin(a: Expression, b: Expression, operator: string, callback: (a: Expression, b: Expression) => Expression | null): Expression {
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