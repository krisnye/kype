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
testSimplify("@ < 10 || 0 < @", "@ is Number");
testSimplify("foo < x || foo > x", "foo != x");

//  test simplifying types
testSimplify("{ @ > 0 } && { @ < 10 }", "{ @ > 0 && @ < 10 }");
testSimplify("{ @ < 10 } || { 0 < @ }", "{ @ is Number }");
testSimplify("{ @ >= 0 } && { @ <= 0 }", "{ @ == 0 }");
testSimplify("{ @ < 0 } || { @ > 0 }", "{ @ != 0 }");

