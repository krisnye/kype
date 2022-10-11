import { BinaryExpression } from "../expressions/BinaryExpression"
import { Expression } from "../expressions/Expression"
import { UnaryExpression } from "../expressions/UnaryExpression"
import { combineExpressions } from "../utility/combineExpressions"
import { equals } from "../utility/equals"
import { memoize } from "../utility/memoize"
import { normalize } from "../utility/normalize"
import splitExpressions from "../utility/splitExpressions"
import { isConsequent } from "./isConsequent"

function find<T>(items: Iterable<T>, predicate: (value: T) => boolean): T | null {
    for (let item of items) {
        if (predicate(item)) {
            return item;
        }
    }
    return null;
}

// A && B || A => A
export const simplify = memoize(function(e: Expression): Expression {
    e = normalize(e);

    if (e instanceof BinaryExpression) {
        let left = simplify(e.left);
        let right = simplify(e.right);
        if (equals(left, right)) {
            if (e.operator === "&&" || e.operator == "||" || e.operator === "&" || e.operator == "|") {
                //  A && A => A
                //  A || A => A
                //  A &  A => A
                //  A |  A => A
                return left;
            }
        }
        else if (e.operator === "||") {
            if (find(splitExpressions(left, "&&"), c => equals(c, right))) {
                // A && B || A => A
                return right
            }
            if (find(splitExpressions(right, "&&"), c => equals(c, left))) {
                //  A || A && B => A
                return left
            }
            if (find(splitExpressions(left, "||"), c => equals(c, right))) {
                // (A || B) || A => A || B
                return left
            }
            if (find(splitExpressions(right, "||"), c => equals(c, left))) {
                //  A || (A && B) => A || B
                return right
            }
        }
        else if (e.operator === "&&") {
            if (isConsequent(right, left) === true) {
                return right;
            }
            //  we only have to filter the right because we know after normalization
            //  that the right side will have the || (if it's on both... then we can't determine anyways)
            let filteredRight = combineExpressions(right.split("||").filter(term => isConsequent(left, term) == null), "||");
            if (!filteredRight) {
                return left;
            }
            else
            {
                right = filteredRight;
            }
        }
        if (e.left !== left || e.right !== right) {
            e = normalize(new BinaryExpression(left, e.operator, right));
        }
    }
    else if (e instanceof UnaryExpression) {
        let argument = simplify(e.argument)
        if (e.argument !== argument) {
            e = new UnaryExpression(e.operator, argument);
        }
    }
    return e
}, true);
