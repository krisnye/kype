
import { Expression } from "./Expression";

export class Literal extends Expression {

    get sortOrder() { return 10; }
    readonly value: number;

    constructor(value: number) {
        super();
        this.value = value;
    }

    toString() {
        return `${this.value}`;
    }

}
