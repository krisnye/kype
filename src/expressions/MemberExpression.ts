
import { Expression } from "./Expression";

export class MemberExpression extends Expression {

    get sortOrder() { return 8; }
    readonly object: Expression;
    readonly property: Expression;

    constructor(object: Expression, property: Expression) {
        super();
        this.object = object;
        this.property = property;
    }

    toStringInternal() {
        return `${this.object}[${this.property}]`;
    }

}
