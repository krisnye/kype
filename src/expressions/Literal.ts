
import { Expression } from "./Expression";

export class Literal<T> extends Expression {

    get sortOrder() { return 10; }
    readonly value: T;

    constructor(value: T) {
        super();
        this.value = value;
    }

    toStringInternal() {
        return JSON.stringify(this.value);
    }

}
