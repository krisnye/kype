import { BinaryExpression } from "./expressions/BinaryExpression"
import { Expression } from "./expressions/Expression"
import { UnaryExpression } from "./expressions/UnaryExpression"
import { combineExpressions } from "./utility/combineExpressions"
import { equals } from "./utility/equals"
import { memoize } from "./utility/memoize"
import { normalize } from "./normalize"
import { isConsequent } from "./isConsequent"
import { joinExpressions } from "./utility/joinExpressions"
import { NumberLiteral } from "./expressions/NumberLiteral"
import { TypeExpression } from "./expressions/TypeExpression"
import { combineTypes } from "./combineTypes"
import { Interval } from "./expressions"

function find<T>(items: Iterable<T>, predicate: (value: T) => boolean): T | null {
    for (let item of items) {
        if (predicate(item)) {
            return item;
        }
    }
    return null;
}

function isTrue(a: Expression) {
    return a instanceof NumberLiteral && a.value !== 0;
}

function isFalse(a: Expression) {
    return a instanceof NumberLiteral && a.value === 0;
}

// A && B || A => A
export const simplify = memoize(function(e: Expression): Expression {
    e = normalize(e);

    if (e instanceof TypeExpression) {
        let proposition = simplify(e.proposition);
        return proposition === e.proposition ? e : new TypeExpression(proposition);
    }

    {
        //  after normalization then similar terms are adjacent to eachother
        //  if we remove ones which are already consequent then this simplifies
        //  for instance
        //  a < 10 && a < 20 && a < 30      -->     a < 10
        let terms = e.split("&&");
        for (let i = terms.length - 1; i > 0; i--) {
            let left = terms[i - 1];
            let right = terms[i];
            if (isConsequent(left, right)) {
                //  remove the right
                terms.splice(i, 1);
            }
            else if (isConsequent(right, left)) {
                //  remove the left;
                terms.splice(i - 1, 1);
            }
        }

        e = joinExpressions(terms, "&&");
    }

    {
        // extract common subexpressions
        //  (A && B) || (A && C) => A && (B || C)
        let commonTerms = new Map<string, Expression>();
        let terms = e.split("||");
        if (terms.length > 1) {
            for (let term of terms[0].split("&&")) {
                // see if this term is in all of the rest of the terms.
                let allOthersContain = terms.slice(1).every(other => other.split("&&").find(otherTerm => equals(otherTerm, term)));
                if (allOthersContain) {
                    commonTerms.set(term.toString(), term);
                }
            }
            if (commonTerms.size > 0) {
                // extract all common terms to left side.
                let removedTerms = e.split("||").map(
                    a => joinExpressions(
                        a.split("&&").filter(
                            b => !commonTerms.has(b.toString())
                        ),
                        "&&"
                    )
                );
                // every term has to still exist
                if (removedTerms.every(term => term)) {
                    let removed = joinExpressions(removedTerms, "||");
                    if (removed) {
                        // console.log({ e: e.toString(), commonTerms: [...commonTerms.values()], removed })
                        return simplify(joinExpressions([joinExpressions([...commonTerms.values()], "&&"), removed], "&&"));
                    }
                }
            }
        }
    }

    if (e instanceof BinaryExpression) {
        let left = simplify(e.left);
        let right = simplify(e.right);
        if (left instanceof TypeExpression && right instanceof TypeExpression) {
            return combineTypes(left, e.operator, right);
        }
        if (equals(left, right)) {
            if (e.operator === "==") {
                return new NumberLiteral(1);
            }
            if (e.operator === "!=") {
                return new NumberLiteral(0);
            }
            if (e.operator === "&&" || e.operator == "||") {
                //  A && A => A
                //  A || A => A
                //  A &  A => A
                //  A |  A => A
                return left;
            }
        }
        else if (e.operator === "||") {
            if (isTrue(left) || isFalse(right)) {
                return left;
            }
            if (isTrue(right) || isFalse(left)) {
                return right;
            }
            if (find(left.splitExpressions("&&"), c => equals(c, right))) {
                // A && B || A => A
                return right;
            }
            if (find(right.splitExpressions("&&"), c => equals(c, left))) {
                //  A || A && B => A
                return left;
            }
            if (find(left.splitExpressions("||"), c => equals(c, right))) {
                // (A || B) || A => A || B
                return left;
            }
            if (find(right.splitExpressions("||"), c => equals(c, left))) {
                //  A || (A && B) => A || B
                return right;
            }
            //  simplify Interval || Interval
            {
                let leftInterval = Interval.getIntervalIfOnlyTerm(left);
                if (leftInterval) {
                    let rightInterval = Interval.getIntervalIfOnlyTerm(right);
                    if (rightInterval) {
                        // see if they overlap.
                        if (leftInterval.type === rightInterval.type && leftInterval.overlaps(rightInterval)) {
                            let combinedInterval = leftInterval.combine(rightInterval);
                            // now convert back to a type
                            // console.log({ left: left.toString(), right: right.toString(), combined: combinedInterval.toString() });
                            return combinedInterval.toType().proposition;
                        }
                    }
                }
            }
            if (left instanceof BinaryExpression &&
                right instanceof BinaryExpression &&
                equals(left.left, right.left)
            ) {
                if (equals(left.right, right.right)) {
                    if (left.operator === ">" && right.operator === "<") {
                        return new BinaryExpression(left.left, "!=", left.right);
                    }
                    if (
                        (left.operator === ">=" && right.operator === "<") ||
                        (left.operator === ">" && right.operator === "<=") ||
                        (left.operator === ">=" && right.operator === "<=")
                    ) {
                        return new NumberLiteral(1);
                    }
                }
                else if (left.operator === ">" && right.operator === "<" && left.right.isLessThan(right.right)) {
                    return new BinaryExpression(left.left, "<=", new NumberLiteral(Number.POSITIVE_INFINITY));
                }
            }
        }
        else if (e.operator === "&&") {
            if (isTrue(left) || isFalse(right)) {
                return right;
            }
            if (isTrue(right) || isFalse(left)) {
                return left;
            }
            //  we only have to filter the right because we know after normalization
            //  that the right side will have the || (if it's on both... then we can't determine anyways)
            let filteredRight = combineExpressions(right.split("||").filter(term => isConsequent(left, term) === null), "||");
            if (!filteredRight) {
                return left;
            }
            else
            {
                right = filteredRight;
            }
            if (left instanceof BinaryExpression &&
                right instanceof BinaryExpression &&
                equals(left.left, right.left) &&
                equals(left.right, right.right)
            ) {
                if (left.operator === ">=" && right.operator === "<=") {
                    return new BinaryExpression(left.left, "==", left.right);
                }
            }
        }
        if (left instanceof NumberLiteral && right instanceof NumberLiteral) {
            e = NumberLiteral.operation(left, e.operator, right);
        }
        else if (e.left !== left || e.right !== right) {
            e = normalize(new BinaryExpression(left, e.operator, right));
        }
    }
    else if (e instanceof UnaryExpression) {
        let argument = simplify(e.argument)
        if (e.argument !== argument) {
            e = new UnaryExpression(e.operator, argument);
        }
    }
    return e;
}, true);
