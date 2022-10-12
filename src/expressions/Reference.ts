
import { Expression } from "./Expression";

export class Reference extends Expression {

    get sortOrder() { return 4; }
    readonly name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }

    toStringInternal() {
        return `${this.name}`;
    }

}
