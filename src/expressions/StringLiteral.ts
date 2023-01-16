
import { Literal } from "./Literal";

export class StringLiteral extends Literal<string> {

    get sortOrder() { return 11; }

    public compareSortOrderSameType(b: StringLiteral): number {
        return this.value.localeCompare(b.value);
    }

}
