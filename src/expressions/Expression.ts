
import { Replace, traverse } from "@glas/traverse";
import { equals } from "../utility/equals";
import { memoize } from "../utility/memoize";

export abstract class Expression {

    public abstract readonly sortOrder: number;
    protected abstract toStringInternal(): string;
    public compareSortOrderSameType(b: any): number {
        return this.toString().localeCompare(b.toString());
    }

    public compare(b: Expression) {
        return (this.sortOrder - b.sortOrder)
            || this.compareSortOrderSameType(b)
    }

    isLessThan(b: Expression): boolean | null {
        return null;
    }

    *splitExpressions(operator: string = "&&"): Iterable<Expression> {
        yield this;
    }

    split(operator: string) {
        return [...this.splitExpressions(operator)];
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
