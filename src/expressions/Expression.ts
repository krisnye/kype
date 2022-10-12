

import { Replace, traverse } from "@glas/traverse";
import { equals } from "../utility/equals";
import { memoize } from "../utility/memoize";
import splitExpressions from "../utility/splitExpressions";

export abstract class Expression {

    public abstract readonly sortOrder: number;
    protected abstract toStringInternal(): string;

    split(operator: string) {
        return [...splitExpressions(this, operator)];
    }

    filter(filterFunction: (e: Expression) => Expression | Replace<Expression>): Expression {
        return traverse(this, {
            leave(node) {
                if (node instanceof Expression) {
                    node = filterFunction(node);
                }
                return node;
            }
        });
    }

    replace(find: Expression, replace: Expression) {
        return this.filter(e => equals(e, find) ? replace : e);
    }

    toString() {
        return Expression.expressionToString(this);
    }

    private static expressionToString = memoize((e: Expression) => e.toStringInternal())
        
}
