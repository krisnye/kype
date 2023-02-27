import { TypeExpression } from "./expressions";
import { BinaryExpression } from "./expressions/BinaryExpression";
import { Expression } from "./expressions/Expression";
import { Literal } from "./expressions/Literal";
import { UnaryExpression } from "./expressions/UnaryExpression";
import { simplify } from "./simplify";
import { equals } from "./utility/equals";
import { isConsequentZ3 as isConsequentZ3 } from "./z3/isConsequentZ3";

export type Maybe = true | false | null
//  a  \  b |  true   false   null
//  --------------------------------
//  true    |  true   true    true
//  false   |  true   false   null
//  null    |  true   null    null
function max(a: Maybe, b: Maybe): Maybe {
    if (a === true || b === true)
        return true
    if (a == null || b == null)
        return null
    return false
}
//  a  \  b |  true   false   null
//  --------------------------------
//  true    |  true   false   null
//  false   |  false  false   false
//  null    |  null   false   null
function min(a: Maybe, b: Maybe): Maybe {
    if (a === false || b === false)
        return false
    if (a == null || b == null)
        return null
    return true
}
//  a  \  b |  true   false   null
//  --------------------------------
//  true    |  true   null    null
//  false   |  null   false   null
//  null    |  null   null    null
function same(a: Maybe, b: Maybe): Maybe {
    return a === b ? a : null
}

export async function isConsequentAsync(a: Expression, b: Expression): Promise<Maybe> {
    // const start = performance.now();
    let result = isConsequent(a, b);
    // const end = performance.now();
    // console.log(`---: ${end - start}`);
    if (result === null) {
        //  sat is pretty slow, so we only run it on non-trivial expressions
        //  we know we can solve the trivial ones.
        if (!(a.isShallow && b.isShallow)) {    //  minor optimization.
            // only run z3 if we can't synchronously prove true or false.
            // const start = performance.now();
            // this is at least 3 orders of magnitude slower than our analysis
            result = await isConsequentZ3(a, b);
            // const end = performance.now();
            // console.log(`+++: ${end - start}`);
        }
    }
    return result;
}

/**
 * Assuming expression 'a' is true then this function returns
 * true if 'b' is necessarily true
 * false if 'b' is necessarily false
 * null if we cannot determine
 */
export function isConsequent(a: Expression, b: Expression): Maybe {
    if (a instanceof TypeExpression) {
        a = a.proposition;
    }
    if (b instanceof TypeExpression) {
        b = b.proposition;
    }
    a = simplify(a);
    b = simplify(b);
    if (equals(a, b)) {
        return true;
    }
    if (a instanceof UnaryExpression && a.operator === "!" && equals(a.argument, b)) {
        return false;
    }
    if (b instanceof UnaryExpression && b.operator === "-" && equals(b.argument, a)) {
        return false;
    }
    if (a instanceof BinaryExpression) {
        if (b instanceof BinaryExpression) {
            if (equals(a.left, b.left)) {
                if (a.right instanceof Literal && b.right instanceof Literal) {
                    let ar = a.right.value;
                    let br = b.right.value;
                    switch (a.operator) {
                        case '>':
                            switch (b.operator) {
                                case '>=':                                  // > 0 is >= 0, > 1 is >= 0
                                case '!=':                                  // > 0 is != 0, > 1 is != 0
                                case '>':  return ar >= br ? true : null    // > 0 is > 0, > 1 is > 0
                                case '<=':                                  // > 0 isnt <= 0, > 1 isnt <= 0
                                case '==':                                  // > 0 isnt == 0, > 1 isnt == 0
                                case '<':  return ar >= br ? false : null   // > 0 isnt < 0, > 1 isnt < 0
                            }
                            break
                        case '>=':
                            switch (b.operator) {
                                case '>=':                                  // >= 1 is >= 0
                                case '>':  return ar > br ?  true : null    // >= 1 is > 0
                                case '==':                                  // >= 1 isnt == 0
                                case '<=': return ar > br ? false : null    // >= 1 isnt <= 0
                                case '<':  return ar >= br ? false : null   // >= 0 isnt < 0, >= 1 isnt < 0
                            }
                            break
                        case '<':
                            switch (b.operator) {
                                case '<=':                                  // < 0 is <= 0, < -1 is <= 0
                                case '!=':                                  // < 0 is != 0, < -1 is != 0
                                case '<':  return ar <= br ?  true : null   // < 0 is < 0, < -1 is < 0
                                case '>=':                                  // < 0 isnt >= 0, < -1 isnt >= 0
                                case '==':                                  // < 0 isnt == 0, < -1 isnt == 0
                                case '>':  return ar <= br ? false : null   // < 0 isnt > 0, < -1 isnt > 0
                            }
                            break
                        case '<=':
                            switch (b.operator) {
                                case '<=':                                  // <= -1 is <= 0
                                case '<':  return ar < br ?  true : null    // <= -1 is < 0
                                case '==':                                  // <= -1 isnt == 0
                                case '>=': return ar < br ? false : null    // <= -1 isnt >= 0
                                case '>':  return ar <= br ? false : null   // <= 0 isnt > 0, <= -1 isnt > 0
                            }
                            break
                        case '==':
                            switch (b.operator) {
                                case '<=': return ar <= br      // == 0 is <= 0, == 0 is <= 1
                                case '<': return ar < br        // == 0 is < 1
                                case '==': return ar === br     // == 0 is == 0
                                case '>=': return ar >= br      // == 0 is >= 0
                                case '>':  return ar > br       // == 0 is > -1
                                case '!=': return ar != br      // == 0 is != 1
                            }
                            break
                        case '!=':
                            switch (b.operator) {
                                case '==': return ar === br ? false : null     // == 0 is == 0
                            }
                            break
                        }
                }
                else if (equals(a.right, b.right)) {
                    // we can still analyze some comparisons if we know the both right hand operators are the same.
                    switch (a.operator) {
                        case '>':
                            switch (b.operator) {
                                case '>=': case '!=': return true;
                                case '<': case '<=': case '==': return false;
                            }
                            break;
                        case '>=':
                            switch (b.operator) {
                                case '<': return false;
                            }
                            break;
                        case '<':
                            switch (b.operator) {
                                case '<=': case '!=': return true;
                                case '>': case '>=': case '==': return false;
                            }
                            break;
                        case '<=':
                            switch (b.operator) {
                                case '>': return false;
                            }
                            break;
                        case '==':
                            switch (b.operator) {
                                case '>=': case '<=': return true;
                                case '>': case '<': case '!=': return false;
                            }
                            break;
                        case '!=':
                            switch (b.operator) {
                                case '==': return false;
                            }
                            break;
                    }
                }
            }
        }
    }

    //  A & B & C => C & D & E
    //  if any term on the left results in a false on the right then false (not consequent)
    //  if all terms on the right are true based on any term on the left then true (consequent)
    //  otherwise null (unknown)
    if (b instanceof BinaryExpression && b.operator === "&&" || a instanceof BinaryExpression && a.operator === "&&") {
        let allTrue = true
        for (let bTerm of b.splitExpressions("&&")) {
            let bTermResult: boolean | null = null
            for (let aTerm of a.splitExpressions("&&")) {
                let aTermResult = isConsequent(aTerm, bTerm)
                if (aTermResult === false) {
                    return false
                }
                if (aTermResult === true) {
                    bTermResult = true
                    break
                }
            }
            if (bTermResult !== true) {
                allTrue = false
            }
        }
        return allTrue || null
    }

    //  A & B => C & D
    if (a instanceof BinaryExpression && a.operator === "||") {
        return same(isConsequent(a.left, b), isConsequent(a.right, b))
    }
    if (b instanceof BinaryExpression && b.operator === "||") {
        return max(isConsequent(a, b.left), isConsequent(a, b.right))
    }
    return null
}