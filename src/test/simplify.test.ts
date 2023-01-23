import { strict as assert } from "assert";
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
testSimplify("A >= B || A < B", "1.0");
testSimplify("B < A || A > 5.0 || A <= B", "1.0");
testSimplify("(A <= 10.0 || A > 10.0) && A > B", "A > B");
testSimplify("A != A", "0.0");
testSimplify("A == A", "1.0");
testSimplify("A != A && A > B", "0.0");

//  simplifying also normalizes.
testSimplify("10.0 == A", "A == 10.0");
testSimplify("x < 120.0 && x < 20.0 && -4.0 > x && 12.0 > x && x < 112.0 && 15.0 > x", "x < -4.0");
testSimplify("x < 120.0 && x < 20.0 && -4.0 < x && 5.0 < x && x < 112.0 && 15.0 > x", "x > 5.0 && x < 15.0");
testSimplify("x < 120.0 && x < 20.0 && -4.0 < x && 5.0 <= x && x < 112.0 && 15.0 > x", "x >= 5.0 && x < 15.0");
testSimplify("x < 120.0 && x < 20.0 && -4.0 < x && 5.0 == x && x < 112.0 && 15.0 > x", "x == 5.0");
testSimplify("3.0 * 4.0 - 10.0 / 2.0", "7.0");
testSimplify("3.0 * 4.0 - x", "12.0 - x");
testSimplify("@ < 10.0 || 0.0 < @", "@ <= POS_INFINITY");
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
testSimplify("{ @ > 0.0 } && { @ < 10.0 }", "{ @ > 0.0 && @ < 10.0 }");
testSimplify("{ @ < 10.0 } || { 0.0 < @ }", "{ @ <= POS_INFINITY }");
testSimplify("{ @ >= 0.0 } && { @ <= 0.0 }", "{ @ == 0.0 }");
testSimplify("{ @ < 0.0 } || { @ > 0.0 }", "{ @ != 0.0 }");

//  type addition
testSimplify("{ @ > 0.0 && @ < 1.0 } + { @ > 2.0 && @ < 3.0 }", "{ @ > 2.0 && @ < 4.0 }");
//  type subtraction
testSimplify("{ @ > 0.0 && @ < 1.0 } - { @ > 2.0 && @ < 3.0 }", "{ @ > -3.0 && @ < -1.0 }");
//  type multiplication
testSimplify("{ @ > 0.0 && @ < 1.0 } * { @ > 2.0 && @ < 3.0 }", "{ @ > 0.0 && @ < 3.0 }");
testSimplify("{ @ >= 0.0 && @ < 1.0 } * { @ > 2.0 && @ < 3.0 }", "{ @ > 0.0 && @ < 3.0 }");
testSimplify("{ @ >= 0.0 && @ < 1.0 } * { @ >= 2.0 && @ < 3.0 }", "{ @ >= 0.0 && @ < 3.0 }");
testSimplify("{ @ >= 0.0 && @ < 1.0 } * { @ > 2.0 && @ <= 3.0 }", "{ @ >= 0.0 && @ < 3.0 }");
testSimplify("{ @ >= -10.0 && @ < 10.0 } * { @ >= -5.0 && @ <= 3.0 }", "{ @ > -50.0 && @ <= 50.0 }");
//  test division
testSimplify("{ @ >= 10.0 && @ <= 20.0 } / { @ >= 5.0 && @ <= 10.0 }", "{ @ >= 1.0 && @ <= 4.0 }");
testSimplify("{ @ > -10.0 && @ <= 20.0 } / { @ >= 5.0 && @ <= 10.0 }", "{ @ > -2.0 && @ <= 4.0 }");
testSimplify("{ @ >= 10.0 && @ <= 20.0 } / { @ >= -5.0 && @ <= 10.0 }", "{ @ <= -2.0 || @ >= 1.0 }");

