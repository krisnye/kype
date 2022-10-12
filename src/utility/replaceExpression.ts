import { traverse } from "@glas/traverse";
import { Expression } from "../expressions/Expression";
import { equals } from "./equals";

export function filterExpressionsRecursive(source: Expression, filter: (e: Expression) => Expression) {
    return traverse(source, {
        leave(node) {
            if (node instanceof Expression) {
                node = filter(node);
            }
            return node;
        }
    })
}

export function replaceExpression(source: Expression, find: Expression, replacement: Expression) {
    return filterExpressionsRecursive(source, e => equals(e, find) ? replacement : e);
}