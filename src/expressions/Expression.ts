
import { Replace, traverse } from "@glas/traverse";
import { equals } from "../utility/equals";
import { memoize } from "../utility/memoize";

export enum ExpressionKind {
    Unknown = 0,
    Boolean = 1,
    Integer = 2,
    Float = 3,
    String = 4
}

export abstract class Expression {

    /**
     * This field can be used by client applications to store and later retrieve information.
     */
    public source: unknown;
    public kind = ExpressionKind.Unknown;

    constructor(source?: unknown) {
        this.source = source;
    }

    /**
     * Returns true if this expression has no sub expressions.
     */
    public get isTerminal() { return true; }
    /**
     * Returns true if this expressions child sub expressions are terminal.
     */
    public get isShallow() { return this.isTerminal }

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
