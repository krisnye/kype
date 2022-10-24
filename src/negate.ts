import { BinaryExpression } from "./expressions/BinaryExpression";
import { BinaryOperator, ComparisonOperator, LogicalOperator } from "./expressions/BinaryOperator";
import { Expression } from "./expressions/Expression";
import { UnaryExpression } from "./expressions/UnaryExpression";
import { UnaryOperator } from "./expressions/UnaryOperator";
import { memoize } from "./utility/memoize";

const negateOperators: { [operator: string]: BinaryOperator } = {
    [ComparisonOperator.greaterThan]: ComparisonOperator.lessThanOrEqual,
    [ComparisonOperator.lessThan]: ComparisonOperator.greaterThanOrEqual,
    [ComparisonOperator.greaterThanOrEqual]: ComparisonOperator.lessThan,
    [ComparisonOperator.lessThanOrEqual]: ComparisonOperator.greaterThan,
    [ComparisonOperator.equality]: ComparisonOperator.inequality,
    [ComparisonOperator.inequality]: ComparisonOperator.equality,
    // [TypeOperator.is]: TypeOperator.isnt,
    // [TypeOperator.isnt]: TypeOperator.is,
}

export const negate = memoize(
    function negate(e: Expression): Expression {
        if (e instanceof UnaryExpression) {
            //  !!A => A
            if (e.operator === UnaryOperator.not) {
                return e.argument
            }
        }
        if (e instanceof BinaryExpression) {
            if (e.operator === LogicalOperator.and || e.operator === LogicalOperator.or) {
                // !(A && B) => !A || !B
                // !(A || B) => !A && !B
                return new BinaryExpression(
                    negate(e.left),
                    e.operator === LogicalOperator.and ? LogicalOperator.or : LogicalOperator.and,
                    negate(e.right),
                )
            }
            let negateOperator = negateOperators[e.operator]
            if (negateOperator != null) {
                // !(A > B) => A <= B
                // !(A < B) => A >= B
                // !(A >= B) => A < B
                // !(A <= B) => A > B
                // !(A is B) => A isnt B
                // !(A isnt B) => A is B
                return new BinaryExpression(e.left, negateOperator, e.right);
            }
        }
        // !(A) => !A
        return new UnaryExpression(UnaryOperator.not, e);
    }
);
