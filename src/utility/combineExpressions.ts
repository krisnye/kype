import { BinaryOperator } from "../expressions";
import { BinaryExpression } from "../expressions/BinaryExpression"
import { Expression } from "../expressions/Expression"

export function combineExpressions(expressions: Array<Expression>, operator: BinaryOperator = "&&"): Expression | undefined {
    let result: Expression | undefined;
    for (let i = expressions.length - 1; i >= 0; i--) {
        let e = expressions[i];
        if (result == null) {
            result = e;
        }
        else {
            //  we iterate in reverse and add new values to left
            //  so that the array will be left to right and symmetrical with toSubExpressions
            result = new BinaryExpression(e, operator, result);
        }
    }
    return result!;
}
