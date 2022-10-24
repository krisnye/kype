import { strict as assert } from "assert";
import { invertInterval } from "../combineTypes";
import { Interval } from "../expressions/Interval";
import { simplify } from "../simplify";
import { parseExpression } from "./parseExpression";

function testSimplify(inputString: string, expectedString: string) {
    let input = parseExpression(inputString);
    let expected = parseExpression(expectedString);
    let actual = simplify(input);
    let as = actual.toString();
    let es = expected.toString();
    assert(as === es, `simplify(${input}), expected: ${es}, actual: ${as}`);
}

testSimplify("A && B || B", "B");
testSimplify("A && A || A", "A");
testSimplify("B || A && B", "B");
testSimplify("A || A && B", "A");
testSimplify("A || B || B", "A || B");
testSimplify("A || B || A", "A || B");
testSimplify("(A || B) && A", "A");
testSimplify("A && (A || B)", "A");
testSimplify("(A || B) && B", "B");
testSimplify("(A || B) && !A", "!A && B")
testSimplify("(A || B) && C && !B", "!B && A && C");
testSimplify("(A || B || C) && !B", "!B && (A || C)");
testSimplify("(A || (B || C)) && !B", "!B && (A || C)");
testSimplify("A > B || A < B", "A != B");
testSimplify("A >= B || A < B", "1");
testSimplify("B < A || A > 5 || A <= B", "1");
testSimplify("(A <= 10 || A > 10) && A > B", "A > B");
testSimplify("A != A", "0");
testSimplify("A == A", "1");
testSimplify("A != A && A > B", "0");

//  simplifying also normalizes.
testSimplify("10 == A", "A == 10");
testSimplify("x < 120 && x < 20 && -4 > x && 12 > x && x < 112 && 15 > x", "x < -4");
testSimplify("x < 120 && x < 20 && -4 < x && 5 < x && x < 112 && 15 > x", "x > 5 && x < 15");
testSimplify("x < 120 && x < 20 && -4 < x && 5 <= x && x < 112 && 15 > x", "x >= 5 && x < 15");
testSimplify("x < 120 && x < 20 && -4 < x && 5 == x && x < 112 && 15 > x", "x == 5");
testSimplify("3 * 4 - 10 / 2", "7");
testSimplify("3 * 4 - x", "12 - x");
testSimplify("@ < 10 || 0 < @", "@ <= POS_INFINITY");
testSimplify("foo < x || foo > x", "foo != x");

//  test +/-infinity
testSimplify("POS_INFINITY + 12.0", "POS_INFINITY");
testSimplify("POS_INFINITY - 12.0", "POS_INFINITY");
testSimplify("POS_INFINITY * 12.0", "POS_INFINITY");
testSimplify("POS_INFINITY / 12.0", "POS_INFINITY");
testSimplify("NEG_INFINITY + 12.0", "NEG_INFINITY");
testSimplify("NEG_INFINITY - 12.0", "NEG_INFINITY");
testSimplify("NEG_INFINITY * 12.0", "NEG_INFINITY");
testSimplify("NEG_INFINITY / 12.0", "NEG_INFINITY");

//  test simplifying types
testSimplify("{ @ > 0 } && { @ < 10 }", "{ @ > 0 && @ < 10 }");
testSimplify("{ @ < 10 } || { 0 < @ }", "{ @ <= POS_INFINITY }");
testSimplify("{ @ >= 0 } && { @ <= 0 }", "{ @ == 0 }");
testSimplify("{ @ < 0 } || { @ > 0 }", "{ @ != 0 }");

//  type addition
testSimplify("{ @ > 0 && @ < 1 } + { @ > 2 && @ < 3 }", "{ @ > 2 && @ < 4 }");
//  type subtraction
testSimplify("{ @ > 0 && @ < 1 } - { @ > 2 && @ < 3 }", "{ @ > -3 && @ < -1 }");
//  type multiplication
testSimplify("{ @ > 0 && @ < 1 } * { @ > 2 && @ < 3 }", "{ @ > 0 && @ < 3 }");
testSimplify("{ @ >= 0 && @ < 1 } * { @ > 2 && @ < 3 }", "{ @ > 0 && @ < 3 }");
testSimplify("{ @ >= 0 && @ < 1 } * { @ >= 2 && @ < 3 }", "{ @ >= 0 && @ < 3 }");
testSimplify("{ @ >= 0 && @ < 1 } * { @ > 2 && @ <= 3 }", "{ @ >= 0 && @ < 3 }");
testSimplify("{ @ >= -10 && @ < 10 } * { @ >= -5 && @ <= 3 }", "{ @ > -50 && @ <= 50 }");
//  test division
testSimplify("{ @ >= 10 && @ <= 20 } / { @ >= 5 && @ <= 10 }", "{ @ >= 1 && @ <= 4 }");
testSimplify("{ @ > -10 && @ <= 20 } / { @ >= 5 && @ <= 10 }", "{ @ > -2 && @ <= 4 }");
testSimplify("{ @ >= 10 && @ <= 20 } / { @ >= -5 && @ <= 10 }", "{ @ <= -2 || @ >= 1 }");

