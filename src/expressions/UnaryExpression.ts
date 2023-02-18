import { Expression } from "./Expression";
import { UnaryOperator } from "./UnaryOperator";

export class UnaryExpression extends Expression {

    get sortOrder() { return 0; }
    readonly operator: UnaryOperator;
    readonly argument: Expression;

    constructor(operator: UnaryOperator, argument: Expression, source?: unknown) {
        super(source);
        this.operator = operator;
        this.argument = argument;
    }

    public compareSortOrderSameType(b: UnaryExpression): number {
        return this.operator.localeCompare(b.operator)
            || this.argument.compare(b.argument);
    }

    toStringInternal() {
        return `${this.operator}${this.argument}`;
    }

}
