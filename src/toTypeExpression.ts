import { Expression } from "./expressions/Expression";
import { equals } from "./utility/equals";
import { joinExpressions } from "./utility/joinExpressions";
import { normalize } from "./normalize";
import { DotExpression } from "./expressions/DotExpression";
import { TypeExpression } from "./expressions/TypeExpression";

export function toTypeExpression(allExpressions: Expression, subExpressionToType: Expression): Expression | undefined {
    return new TypeExpression(normalize(joinExpressions(allExpressions.split("&&").map(
        e => {
            const replaced = e.replace(subExpressionToType, new DotExpression());
            return equals(e, replaced) ? null : replaced;
        }
    ).filter(e => e != null) as Expression[], "&&")!));
}