
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

    toStringInternal() {
        return `(${this.left} ${this.operator} ${this.right})`;
    }

}
