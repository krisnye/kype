import { BinaryOperator } from "./expressions";
import { BinaryExpression } from "./expressions/BinaryExpression";
import { Expression } from "./expressions/Expression";
import { UnaryExpression } from "./expressions/UnaryExpression";
import { UnaryOperator } from "./expressions/UnaryOperator";
import { memoize } from "./utility/memoize";

const negateOperators: { [K in BinaryOperator]?: BinaryOperator } = {
    ">": "<=",
    "<": ">=",
    ">=": "<",
    "<=": ">",
    "==": "!=",
    "!=": "==",
}

export const negate = memoize(
    function negate(e: Expression): Expression {
        if (e instanceof UnaryExpression) {
            //  !!A => A
            if (e.operator === "!") {
                return e.argument
            }
        }
        if (e instanceof BinaryExpression) {
            if (e.operator === "&&" || e.operator === "||") {
                // !(A && B) => !A || !B
                // !(A || B) => !A && !B
                return new BinaryExpression(
                    negate(e.left),
                    e.operator === "&&" ? "||" : "&&",
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
        return new UnaryExpression("!", e);
    }
);
