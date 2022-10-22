import { Expression } from "./Expression";

export class TypeExpression extends Expression {

    get sortOrder() { return 11; }
    proposition: Expression;

    constructor(proposition: Expression) {
        super();
        this.proposition = proposition;
    }

    public compareSortOrderSameType(b: TypeExpression): number {
        return this.proposition.compare(b.proposition);
    }

    toStringInternal() {
        return `{${this.proposition}}`;
    }

}
