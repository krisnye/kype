
import { BinaryOperator, compareBinaryOperator } from "./BinaryOperator";
import { Expression, ExpressionKind } from "./Expression";

export class BinaryExpression extends Expression {

    get sortOrder() { return 1; }
    readonly left: Expression;
    readonly operator: BinaryOperator;
    readonly right: Expression;

    constructor(left: Expression, operator: BinaryOperator, right: Expression, kind = ExpressionKind.Unknown) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
        this.kind = kind;
    }

    public get isTerminal() { return false; }
    public get isShallow() { return this.left.isTerminal && this.right.isTerminal; }

    *splitExpressions(operator: string = "&&"): Iterable<Expression> {
        if (this.operator === operator) {
            yield* this.left.splitExpressions(operator);
            yield* this.right.splitExpressions(operator);
        }
        else {
            yield this;
        }
    }

    public compareSortOrderSameType(b: BinaryExpression): number {
        return this.left.compare(b.left)
            || this.right.compare(b.right)
            || compareBinaryOperator(this.operator, b.operator);
    }

    isLeftNumber(): boolean | null {
        switch (this.operator) {
            //  these operators are only valid on numbers
            //  so we know the left hand side is a number.
            case "<":
            case "<=":
            case ">":
            case ">=":
                return true;
            default:
                return null;
        }
    }

    toStringInternal() {
        return `(${this.left} ${this.operator} ${this.right})`;
    }

}
