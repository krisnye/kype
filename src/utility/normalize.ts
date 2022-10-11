
import { BinaryExpression } from "../expressions/BinaryExpression";
import { BinaryOperator, ComparisonOperator, LogicalOperator, MathOperator } from "../expressions/BinaryOperator";
import { Expression } from "../expressions/Expression"
import { UnaryExpression } from "../expressions/UnaryExpression";
import { memoize } from "./memoize";

const reflectOperators: { [operator: string]: BinaryOperator } = {
    [ComparisonOperator.greaterThan]: ComparisonOperator.lessThanOrEqual,
    [ComparisonOperator.lessThan]: ComparisonOperator.greaterThanOrEqual,
    [ComparisonOperator.greaterThanOrEqual]: ComparisonOperator.lessThan,
    [ComparisonOperator.lessThanOrEqual]: ComparisonOperator.greaterThan,
    [ComparisonOperator.equality]: ComparisonOperator.equality,
    [ComparisonOperator.inequality]: ComparisonOperator.inequality,
    [MathOperator.addition]: MathOperator.addition,
    [MathOperator.multiplication]: MathOperator.multiplication,
    [LogicalOperator.and]: LogicalOperator.and,
    [LogicalOperator.or]: LogicalOperator.or,
}

const reassociateLeft: { [operator: string]: boolean } = {
    "|": true,
    "&": true,
    "||": true,
    "&&": true,
    "+": true,
    "*": true,
}

function shouldSwapOrder(left: Expression, right: Expression) {
    let compare = left.sortOrder - right.sortOrder;
    if (compare === 0 && left instanceof BinaryExpression && right instanceof BinaryExpression) {
        compare = left.operator.localeCompare(right.operator);
    }
    if (compare === 0 && left instanceof UnaryExpression && right instanceof UnaryExpression) {
        compare = left.operator.localeCompare(right.operator);
    }
    if (compare === 0) {
        compare = left.toString().localeCompare(right.toString());
    }
    return compare > 0;
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
        if (canSwap && shouldSwapOrder(left, right)) {
            [left, right] = [right, left]
            operator = reflectOperators[operator]
        }
        if (reassociateLeft[operator]) {
            if (right instanceof BinaryExpression && right.operator === operator) {
                left = new BinaryExpression(left, operator, right.left);
                right = right.right;
            }
        }
        if (left !== e.left || right !== e.right || operator !== e.operator) {
            e = new BinaryExpression(left, operator, right);
        }
    }
    return e
}, true);
