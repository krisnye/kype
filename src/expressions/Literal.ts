
import { Expression } from "./Expression";

export abstract class Literal<T> extends Expression {

    get sortOrder() { return 10; }
    readonly value: T;

    constructor(value: T, source?: unknown) {
        super(source);
        this.value = value;
    }

    toStringInternal() {
        return typeof this.value === "bigint" ? this.value.toString() : JSON.stringify(this.value);
    }

}
