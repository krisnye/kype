import type { Expression } from "../expressions/Expression";

export function equals(a?: Expression, b?: Expression) {
    if (a === b) {
        return true;
    }
    if (!a || !b) {
        return false;
    }
    return a.toString() === b.toString();
}
