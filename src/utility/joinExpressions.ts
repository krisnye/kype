import { BinaryExpression } from "../expressions/BinaryExpression";
import { Expression } from "../expressions/Expression";

export function joinExpressions(expressions: Expression[], operator: string): Expression {
    let left = expressions[0];
    for (let i = 1; i < expressions.length; i++) {
        const right = expressions[i];
        left = new BinaryExpression(
            left,
            operator,
            right,
        );
    }
    return left;
}