
import { Expression } from "./Expression";

export class CallExpresssion extends Expression {

    get sortOrder() { return 2; }
    readonly callee: Expression;
    readonly arguments: Expression[];

    constructor(callee: Expression, args: Expression[]) {
        super();
        this.callee = callee;
        this.arguments = args;
    }

    toString() {
        return `${this.callee}(${this.arguments.join(`,`)})`;
    }

}
