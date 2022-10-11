import { BinaryExpression } from "../expressions/BinaryExpression"
import { Expression } from "../expressions/Expression"

export default function *splitExpressions(e: Expression, operator: string = "&&"): Iterable<Expression> {
    if (e instanceof BinaryExpression && e.operator === operator) {
        yield* splitExpressions(e.left, operator)
        yield* splitExpressions(e.right, operator)
    }
    else {
        yield e
    }
}
