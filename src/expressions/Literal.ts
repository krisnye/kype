
import { Expression } from "./Expression";

export abstract class Literal<T> extends Expression {

    get sortOrder() { return 10; }
    readonly value: T;

    constructor(value: T, source?: unknown) {
        super(source);
        this.value = value;
    }

    toStringInternal() {
        return Literal.toString(this.value);
    }

    static toString(value: unknown) {
        switch (typeof value) {
            case "bigint":
                return value.toString();
            case "number":            
                return Number.isInteger(value) ? value.toFixed(1) : value.toString();
            default:
                return JSON.stringify(value);
        }
    }

}
