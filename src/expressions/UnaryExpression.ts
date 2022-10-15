import { Expression } from "./Expression";

export class UnaryExpression extends Expression {

    get sortOrder() { return 0; }
    readonly operator: string;
    readonly argument: Expression;

    constructor(operator: string, argument: Expression) {
        super();
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
