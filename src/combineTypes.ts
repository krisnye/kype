import { BinaryExpression } from "./expressions/BinaryExpression";
import { LogicalOperator, MathOperator } from "./expressions/BinaryOperator";
import { Expression } from "./expressions/Expression";
import { Interval } from "./expressions/Interval";
import { TypeExpression } from "./expressions/TypeExpression";
import { simplify } from "./simplify";
import { joinExpressions } from "./utility/joinExpressions";

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
        default:
            throw new Error(`Could not combine types: ${left} ${operator} ${right}`);
    }
}

//  sorted expressions.
// ['!=', '<', '<=', '==', '>', '>=']
const combineOps: { [opA: string]: { [opB: string]: string } } = {
    "!=": {
        "!=": "!="
    },
    "<": {
        "<": "<",
        "<=": "<",
        "==": "<",
    },
    "<=": {
        "<=": "<=",
        "==": "<=",
    },
    "==": {
        "==": "==",
        ">": ">",
        ">=": ">=",
    },
    ">": {
        ">": ">",
        ">=": ">",
    },
    ">=": {
        ">=": ">=",
    }
}

function combineComparisonOps(opA: string, opB: string, combinOperator: string): string | undefined {
    if (opA.localeCompare(opB) < 0) {
        let swap = opA;
        opA = opB;
        opB = swap;
    }
    return combineOps[opA]?.[opB];
}

function foreachIntervalPair(a: TypeExpression, b: TypeExpression, callback: (a: Interval, b: Interval) => Expression | null): Expression {
    return foreachSplitRejoin(Interval.fromType(a), Interval.fromType(b), "||", (a, b) => {
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