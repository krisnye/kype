import { BinaryExpression } from "../expressions/BinaryExpression";
import { Expression } from "../expressions/Expression";

export function joinExpressions(expressions: Expression[], operator: string): Expression {
    let right = expressions[expressions.length - 1];
    for (let i = expressions.length - 2; i >= 0; i--) {
        const left = expressions[i];
            right = new BinaryExpression(
                left,
                operator,
                right,
            );
    }
    return right;
}