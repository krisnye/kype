import { LogicalOperator } from "./expressions/BinaryOperator";
import { Expression } from "./expressions/Expression";
import { Reference } from "./expressions/Reference";
import { equals } from "./utility/equals";
import { joinExpressions } from "./utility/joinExpressions";
import { normalize } from "./normalize";

export function toTypeExpression(allExpressions: Expression, subExpressionToType: Expression): Expression | undefined {
    const thisExpression = new Reference("this");
    return normalize(joinExpressions(allExpressions.split(LogicalOperator.and).map(
        e => {
            const replaced = e.replace(subExpressionToType, thisExpression);
            // console.log({
            //     all: allExpressions.toString(),
            //     sub: subExpressionToType.toString(),
            //     e: e.toString(),
            //     replaced: replaced.toString(),
            //     "equals(e, replaced)": equals(e, replaced)
            // })
            return equals(e, replaced) ? null : replaced;
        }
    ).filter(e => e != null) as Expression[], LogicalOperator.and)!);
}