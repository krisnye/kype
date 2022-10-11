import { BinaryExpression } from "../expressions/BinaryExpression";
import { LogicalOperator } from "../expressions/BinaryOperator";
import { Expression } from "../expressions/Expression";
import { Literal } from "../expressions/Literal";
import { UnaryExpression } from "../expressions/UnaryExpression";
import { UnaryOperator } from "../expressions/UnaryOperator";
import { equals } from "../utility/equals";
import splitExpressions from "../utility/splitExpressions";

type Maybe = true | false | null
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

/**
 * Assuming expression 'a' is true then this function returns
 * true if 'b' is necessarily true
 * false if 'b' is necessarily false
 * null if we cannot determine
 */
export function isConsequent(a: Expression, b: Expression): Maybe {
    if (equals(a, b)) {
        return true;
    }
    if (a instanceof UnaryExpression && a.operator === UnaryOperator.not && equals(a.argument, b)) {
        return false;
    }
    if (b instanceof UnaryExpression && b.operator === UnaryOperator.not && equals(b.argument, a)) {
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
                    }
                }
                else if (equals(a.right, b.right)) {
                    // we can still analyze some comparisons if we know the both right hand operators are the same.
                    switch (a.operator) {
                        case '>':
                            switch (b.operator) {
                                case '>=': case '!=': return true
                                case '<': case '<=': case '==': return false
                            }
                            break
                        case '>=':
                            switch (b.operator) {
                                case '<': return false
                            }
                            break
                        case '<':
                            switch (b.operator) {
                                case '<=': case '!=': return true
                                case '>': case '>=': case '==': return false
                            }
                            break
                        case '<=':
                            switch (b.operator) {
                                case '>': return false
                            }
                            break
                        case '==':
                            switch (b.operator) {
                                case '>=': case '<=': return true
                                case '>': case '<': case '!=': return false
                            }
                            break
                        case '!=':
                            switch (b.operator) {
                                case '==': return false
                            }
                            break
                        case 'is':
                            switch (b.operator) {
                                case 'isnt': return false
                            }
                            break
                        case 'isnt':
                            switch (b.operator) {
                                case 'is': return false
                            }
                            break
                    }
                }
            }
        }
    }

    //  A & B & C => C & D & E
    //  if any term on the left results in a false on the right then false (not consequent)
    //  if all terms on the right are true based on any term on the left then true (consequent)
    //  otherwise null (unknown)
    if (b instanceof BinaryExpression && b.operator === LogicalOperator.and || a instanceof BinaryExpression && a.operator === LogicalOperator.and) {
        let allTrue = true
        for (let bTerm of splitExpressions(b, LogicalOperator.and)) {
            let bTermResult: boolean | null = null
            for (let aTerm of splitExpressions(a, LogicalOperator.and)) {
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
    if (a instanceof BinaryExpression && a.operator === LogicalOperator.or) {
        return same(isConsequent(a.left, b), isConsequent(a.right, b))
    }
    if (b instanceof BinaryExpression && b.operator === LogicalOperator.or) {
        return max(isConsequent(a, b.left), isConsequent(a, b.right))
    }
    return null
}