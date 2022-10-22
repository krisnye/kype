import { BinaryExpression } from "./expressions/BinaryExpression";
import { BinaryOperator, LogicalOperator, MathOperator } from "./expressions/BinaryOperator";
import { TypeExpression } from "./expressions/TypeExpression";
import { simplify } from "./simplify";


export function combineTypes(left: TypeExpression, operator: string, right: TypeExpression) {
    switch (operator) {
        case LogicalOperator.and:
        case LogicalOperator.or:
            return new TypeExpression(
                simplify(new BinaryExpression(left.proposition, operator, right.proposition))
            );
        case MathOperator.addition:
            // TODO: split all lefts, split all rights, combine and rejoin.
        default:
            throw new Error(`Could not combine types: ${left} ${operator} ${right}`);
    }
}