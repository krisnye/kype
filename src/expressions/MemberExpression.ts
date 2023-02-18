
import { Expression } from "./Expression";
import { Reference } from "./Reference";

// TODO: Remove this class as well.
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
        return this.property instanceof Reference ?  `${this.object}.${this.property}` : `${this.object}[${this.property}]`;
    }

}
