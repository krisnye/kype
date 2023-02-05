
import { isIntegerLiteral, NumberLiteral } from "./expressions";
import { BinaryExpression } from "./expressions/BinaryExpression";
import { BinaryOperator, ComparisonOperator, LogicalOperator, MathOperator } from "./expressions/BinaryOperator";
import type { Expression } from "./expressions/Expression"
import { UnaryExpression } from "./expressions/UnaryExpression";
import { joinExpressions } from "./utility/joinExpressions";
import { memoize } from "./utility/memoize";

const reflectOperators: { [operator: string]: BinaryOperator } = {
    [ComparisonOperator.greaterThan]: ComparisonOperator.lessThan,
    [ComparisonOperator.lessThan]: ComparisonOperator.greaterThan,
    [ComparisonOperator.greaterThanOrEqual]: ComparisonOperator.lessThanOrEqual,
    [ComparisonOperator.lessThanOrEqual]: ComparisonOperator.greaterThanOrEqual,
    [ComparisonOperator.equality]: ComparisonOperator.equality,
    [ComparisonOperator.inequality]: ComparisonOperator.inequality,
    [MathOperator.addition]: MathOperator.addition,
    [MathOperator.multiplication]: MathOperator.multiplication,
    [LogicalOperator.and]: LogicalOperator.and,
    [LogicalOperator.or]: LogicalOperator.or,
}

const reassociateLeft: { [operator: string]: boolean } = {
    [LogicalOperator.or]: true,
    [LogicalOperator.and]: true,
    [MathOperator.addition]: true,
    [MathOperator.multiplication]: true,
}

function compareSortOrder(left: Expression, right: Expression) {
    return left.compare(right);
}

export const normalize = memoize(function(e: Expression): Expression {
    if (e instanceof UnaryExpression) {
        return new UnaryExpression(e.operator, normalize(e.argument));
    }
    if (e instanceof BinaryExpression) {
        let left = normalize(e.left);
        let right = normalize(e.right);
        let operator = e.operator;
        let canSwap = reflectOperators[operator] != null;
        if (canSwap && compareSortOrder(left, right) > 0) {
            [left, right] = [right, left]
            operator = reflectOperators[operator]
        }
        if (isIntegerLiteral(right)) {
            if (operator === "<") {
                operator = "<=";
                right = new NumberLiteral(right.value - 1n);
            }
            else if (operator === ">") {
                operator = ">=";
                right = new NumberLiteral(right.value + 1n);
            }
        }
        if (left !== e.left || right !== e.right || operator !== e.operator) {
            e = new BinaryExpression(left, operator, right);
        }
        if (reassociateLeft[operator]) {
            e = joinExpressions(e.split(operator).sort(compareSortOrder), operator)!;
        }
    }
    return e
}, true);
