
import { equals } from "../utility/equals";
import { compareBinaryOperator } from "./BinaryOperator";
import { Expression } from "./Expression";

export class BinaryExpression extends Expression {

    get sortOrder() { return 1; }
    readonly left: Expression;
    readonly operator: string;
    readonly right: Expression;

    constructor(left: Expression, operator: string, right: Expression) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
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
            // case "is":
            //     return equals(this.right, Types.Number);
            // case "isnt":
            //     if (equals(this.right, Types.Number)) {
            //         return false;
            //     }
            default:
                return null;
        }
    }

    toStringInternal() {
        return `(${this.left} ${this.operator} ${this.right})`;
    }

}
