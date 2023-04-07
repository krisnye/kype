import { BinaryExpression } from "./expressions/BinaryExpression"
import { Expression } from "./expressions/Expression"
import { UnaryExpression } from "./expressions/UnaryExpression"
import { combineExpressions } from "./utility/combineExpressions"
import { equals } from "./utility/equals"
import { memoize } from "./utility/memoize"
import { normalize } from "./normalize"
import { isConsequent } from "./isConsequent"
import { joinExpressions } from "./utility/joinExpressions"
import { NumberLiteral, isIntegerLiteral } from "./expressions/NumberLiteral"
import { TypeExpression } from "./expressions/TypeExpression"
import { combineTypes } from "./combineTypes"
import { DotExpression, Interval, isInfinite } from "./expressions"
import { falseExpression, isFalse, isTrue, positiveInfinity, trueExpression } from "./constants"

function find<T>(items: Iterable<T>, predicate: (value: T) => boolean): T | null {
    for (let item of items) {
        if (predicate(item)) {
            return item;
        }
    }
    return null;
}

function adjacentValuesToRange(e: Expression): Expression {
    let terms = e.split("||");
    if (terms.length > 1) {
        const leftTerms = new Map<string, Expression>();
        const rightValues = new Array<bigint>();
        for (const term of terms) {
            if (!(term instanceof BinaryExpression && term.operator === "==" && isIntegerLiteral(term.right))) {
                return e;
            }
            leftTerms.set(term.left.toString(), term.left);
            if (leftTerms.size > 1) {
                return e;
            }
            rightValues.push(term.right.value);
        }
        // these should already be sorted by normalization.
        const start = rightValues[0];
        const finish = rightValues[rightValues.length - 1];
        for (let i = 1; i < rightValues.length; i++) {
            const a = rightValues[i - 1];
            const b = rightValues[i];
            if (a + 1n !== b) {
                return e;
            }
        }
        const left = [...leftTerms.values()][0];
        return joinExpressions([
            new BinaryExpression(left, ">=", new NumberLiteral(start)),
            new BinaryExpression(left, "<=", new NumberLiteral(finish))
        ], "&&");
    }
    return e;
}

// A && B || A => A
export const simplify = memoize(function (e: Expression): Expression {
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
        terms = terms.map(adjacentValuesToRange);
        e = joinExpressions(terms, "&&");
    }

    {
        //  after normalization then similar terms are adjacent to eachother
        //  if we remove ones which are already consequent then this simplifies
        //  for instance
        //  a != 0 || a == 1        -> a != 0
        let terms = e.split("||");
        for (let i = terms.length - 1; i > 0; i--) {
            let left = terms[i - 1];
            let right = terms[i];
            if (isConsequent(left, right)) {
                //  remove the left;
                terms.splice(i - 1, 1);
            }
            else if (isConsequent(right, left)) {
                //  remove the right
                terms.splice(i, 1);
            }
        }

        // see if interval parsing simplifies terms.
        terms = terms.map(term => {
            const [intervals, remaining] = Interval.fromAndTypeWithRemaining(term);
            if (intervals.length > 0) {
                const andTerms = term.split("&&");
                if (remaining.length <= andTerms.length) {
                    // maybe combine and see if shorter.
                    const intervalTerms = intervals.map(i => i.toTerms()).flat();
                    if (remaining.length + intervalTerms.length < andTerms.length) {
                        return joinExpressions([...intervalTerms, ...remaining], "&&");
                    }
                }
            }
            return term;
        })

        e = joinExpressions(terms, "||");
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

        if (right instanceof TypeExpression || right instanceof Interval) {
            if ([">", ">=", "<", "<="].includes(e.operator)) {
                const rightIntervals = Interval.fromOrType(right);
                if (rightIntervals.length === 1) {
                    const rightInterval = rightIntervals[0];
                    if (left instanceof DotExpression && (
                        e.operator.startsWith("<") && isInfinite(rightInterval.min)
                        ||
                        e.operator.startsWith(">") && isInfinite(rightInterval.max)
                    )) {
                        switch (e.operator) {
                            case "<":
                                return simplify(new BinaryExpression(left, "<", new NumberLiteral(rightInterval.max)));
                            case "<=":
                                return simplify(new BinaryExpression(left, rightInterval.maxExclusive ? "<" : "<=", new NumberLiteral(rightInterval.max)));
                            case ">":
                                const before = new BinaryExpression(left, ">", new NumberLiteral(rightInterval.min));
                                const after = simplify(before);
                                // console.log({ before: before.toString(), after: after.toString() });
                                return after;
                            case ">=":
                                return simplify(new BinaryExpression(left, rightInterval.minExclusive ? ">" : ">=", new NumberLiteral(rightInterval.min)));
                        }
                    }

                    const leftIntervals = Interval.fromOrType(left);
                    if (leftIntervals.length === 1) {
                        const leftInterval = leftIntervals[0];
                        switch (e.operator) {
                            case "<":
                            case "<=":
                                return simplify(
                                    new BinaryExpression(
                                        left instanceof DotExpression ? left : new NumberLiteral(leftInterval.max),
                                        e.operator,
                                        new NumberLiteral(rightInterval.min)
                                    )
                                );
                            case ">":
                            case ">=":
                                return simplify(
                                    new BinaryExpression(
                                        left instanceof DotExpression ? left : new NumberLiteral(leftInterval.min),
                                        e.operator,
                                        new NumberLiteral(rightInterval.max)
                                    )
                                );
                        }
                    }
                }
            }
        }

        if (equals(left, right)) {
            if (e.operator === "==" || e.operator === "<=" || e.operator === ">=") {
                return trueExpression;
            }
            if (e.operator === "!=") {
                return falseExpression;
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
                let [leftInterval, leftRemaining] = Interval.fromAndTypeWithRemaining(left);
                let [rightInterval, rightRemaining] = Interval.fromAndTypeWithRemaining(right);
                if (leftInterval.length && rightInterval.length) {
                    let merged = false;
                    let intervals = [...leftInterval, ...rightInterval];
                    for (let i = intervals.length - 2; i >= 0; i--) {
                        let leftInterval = intervals[i];
                        let rightInterval = intervals[i + 1];
                        // see if they overlap.
                        if (leftInterval.type === rightInterval.type && leftInterval.overlapsOrAdjacentIfInteger(rightInterval)) {
                            let combinedInterval = leftInterval.combine(rightInterval);
                            // now convert back to a type
                            // console.log({ left: left.toString(), right: right.toString(), combined: combinedInterval.toString() });
                            intervals.splice(i, 2, combinedInterval);
                            merged = true;
                        }
                    }
                    if (merged) {
                        return joinExpressions([...intervals.map(i => i.toTerms()).flat(), ...leftRemaining, ...rightRemaining], "&&");
                    }
                }
            }
            if (left instanceof BinaryExpression &&
                right instanceof BinaryExpression &&
                equals(left.left, right.left)
            ) {
                if (isIntegerLiteral(left.right) && isIntegerLiteral(right.right)) {
                    if (left.operator === "<=" && right.operator === ">=" && (left.right.value + 2n) === right.right.value) {
                        return new BinaryExpression(left.left, "!=", new NumberLiteral(left.right.value + 1n));
                    }
                }

                if (equals(left.right, right.right)) {
                    if (
                        left.operator === ">" && right.operator === "<" ||
                        left.operator === "<" && right.operator === ">"
                    ) {
                        return new BinaryExpression(left.left, "!=", left.right);
                    }

                    if (
                        (left.operator === ">=" && right.operator === "<") ||
                        (left.operator === ">" && right.operator === "<=") ||
                        (left.operator === ">=" && right.operator === "<=")
                    ) {
                        // return true?
                        return new NumberLiteral(1n);
                    }
                }
                else if (left.operator === ">" && right.operator === "<" && left.right.isLessThan(right.right)) {
                    return new BinaryExpression(left.left, "<=", positiveInfinity);
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
            if (isConsequent(left, right) === false) {
                return falseExpression;
            }

            let filteredRight = combineExpressions(right.split("||").filter(term => isConsequent(left, term) === null), "||");
            if (!filteredRight) {
                return left;
            }
            else {
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
