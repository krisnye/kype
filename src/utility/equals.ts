import { Expression } from "../expressions/Expression";
import { normalize } from "./normalize";

export function equals(a: Expression, b: Expression) {
    return a === b || normalize(a).toString() === normalize(b).toString();
}
