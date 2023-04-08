import { strict as assert } from "assert";
import { simplify } from "../simplify";
import { parseExpression } from "../parser/parseExpression";

function testSimplify(inputString: string, expectedString: string) {
    let input = parseExpression(inputString);
    let expected = parseExpression(expectedString);
    let actual = simplify(input);
    let as = actual.toString();
    let es = expected.toString();
    assert(as === es, `simplify(${input})\n  expect: ${es}\n  actual: ${as}\n`);
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
testSimplify("B < A || A > 5.0 || A <= B", "1");
testSimplify("(A <= 10.0 || A > 10.0) && A > B", "A > B");
testSimplify("A != A", "0");
testSimplify("A == A", "1");
testSimplify("A != A && A > B", "0");
testSimplify("A && B || A && C", "(B || C) && A");

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

//  TODO: actually simplify this into foo > 0 && foo < 20
testSimplify(`(@ > 0 && @ < 10) || (@ > 5 && @ < 20)`, "(@ >= 1 && @ <= 19)")

//  test +/-infinity
testSimplify("POS_INFINITY + 12.0", "POS_INFINITY");
testSimplify("POS_INFINITY - 12.0", "POS_INFINITY");
testSimplify("POS_INFINITY * 12.0", "POS_INFINITY");
testSimplify("POS_INFINITY / 12.0", "POS_INFINITY");
testSimplify("NEG_INFINITY + 12.0", "NEG_INFINITY");
testSimplify("NEG_INFINITY - 12.0", "NEG_INFINITY");
testSimplify("NEG_INFINITY * 12.0", "NEG_INFINITY");
testSimplify("NEG_INFINITY / 12.0", "NEG_INFINITY");

//  test simplifying float types
testSimplify("{ @ > 0.0 } && { @ < 10.0 }", "{ @ > 0.0 && @ < 10.0 }");
testSimplify("{ @ < 10.0 } || { 0.0 < @ }", "{ @ <= POS_INFINITY }");
testSimplify("{ @ >= 0.0 } && { @ <= 0.0 }", "{ @ == 0.0 }");
testSimplify("{ @ < 0.0 } || { @ > 0.0 }", "{ @ != 0.0 }");

//  type float addition
testSimplify("{ @ > 0.0 && @ < 1.0 } + { @ > 2.0 && @ < 3.0 }", "{ @ > 2.0 && @ < 4.0 }");
//  type float subtraction
testSimplify("{ @ > 0.0 && @ < 1.0 } - { @ > 2.0 && @ < 3.0 }", "{ @ > -3.0 && @ < -1.0 }");
//  type float multiplication
testSimplify("{ @ > 0.0 && @ < 1.0 } * { @ > 2.0 && @ < 3.0 }", "{ @ > 0.0 && @ < 3.0 }");
testSimplify("{ @ >= 0.0 && @ < 1.0 } * { @ > 2.0 && @ < 3.0 }", "{ @ > 0.0 && @ < 3.0 }");
testSimplify("{ @ >= 0.0 && @ < 1.0 } * { @ >= 2.0 && @ < 3.0 }", "{ @ >= 0.0 && @ < 3.0 }");
testSimplify("{ @ >= 0.0 && @ < 1.0 } * { @ > 2.0 && @ <= 3.0 }", "{ @ >= 0.0 && @ < 3.0 }");
testSimplify("{ @ >= -10.0 && @ < 10.0 } * { @ >= -5.0 && @ <= 3.0 }", "{ @ > -50.0 && @ <= 50.0 }");
testSimplify("{ @ <= POS_INFINITY } * { @ <= POS_INFINITY }", "{ @ <= POS_INFINITY }");

testSimplify("{ @ > 0.0 } * { @ < 0.0 }", "{ @ < 0.0 }");

//  test float division
testSimplify("{ @ >= 10.0 && @ <= 20.0 } / { @ >= 5.0 && @ <= 10.0 }", "{ @ >= 1.0 && @ <= 4.0 }");
testSimplify("{ @ > -10.0 && @ <= 20.0 } / { @ >= 5.0 && @ <= 10.0 }", "{ @ > -2.0 && @ <= 4.0 }");
testSimplify("{ @ >= 10.0 && @ <= 20.0 } / { @ >= -5.0 && @ <= 10.0 }", "{ @ <= -2.0 || @ >= 1.0 }");
testSimplify("{ @ >= 2.0 && @ < 3.0 } / { @ >= -1.0 && @ < 4.0 }", "{ @ <= -2.0 || @ > 0.5 }");
testSimplify("{ @ <= POS_INFINITY } / { @ <= POS_INFINITY }", "{ @ <= POS_INFINITY }");
testSimplify("{ @ > 0.0 } / { @ <= POS_INFINITY }", "{ @ <= POS_INFINITY }");
testSimplify("{ @ > 20.0 } / { @ <= 10.0 }", "{ @ <= 0.0 || @ > 2.0 }");

// /////////////////////////////////////////////////////////////////////////////////////////////
// //  type float exponentiation
// testSimplify("{ @ >= 0.0 && @ <= 5.0 } ** { @ >= 2.0 && @ <= 3.0 }", "{ @ >= 0.0 && @ <= 125.0 }");
//  -2 ** 2 == 4
//  -2 ** 3 == -8
//  -2 ** 4 == 16
//  -2 ** 5 == -32
//  -2 ** 6 == 64
//  -2 ** 7 == -128
//  -2 ** 8 == 256
testSimplify("{ @ >= -2.0 && @ <= 1.0 } ** { @ >= 2.0 && @ <= 8.0 }", "{ @ >= -128.0 && @ <= 256.0 }");
/////////////////////////////////////////////////////////////////////////////////////////////

//  test float modulus
testSimplify("{ @ >= 10.0 && @ <= 20.0 } % { @ >= 5.0 && @ <= 10.0 }", "{ @ >= 0.0 && @ < 10.0 }");
testSimplify("{ @ > -10.0 && @ <= 20.0 } % { @ >= 5.0 && @ <= 10.0 }", "{ @ > -10.0 && @ < 10.0 }");
// this one should actually throw an error since the modulus can be zero.
testSimplify("{ @ >= 10.0 && @ <= 20.0 } % { @ >= -5.0 && @ <= 10.0 }", "{ @ >= 0.0 && @ < 10.0 }");


//  type integer addition
testSimplify("{ @ > 0 && @ < 10 } + { @ > 2 && @ < 6 }", "{ @ >= 4 && @ <= 14 }");
//  type integer subtraction
testSimplify("{ @ > 0 && @ < 10 } - { @ > 2 && @ < 6 }", "{ @ >= -4 && @ <= 6 }");
testSimplify("{ @ >= 1 && @ <= 9 } - { @ >= 3 && @ <= 5 }", "{ @ >= -4 && @ <= 6 }");
//  type integer multiplication
testSimplify("{ @ >= 1 && @ <= 9 } * { @ >= 3 && @ <= 5 }", "{ @ >= 3 && @ <= 45 }");
testSimplify("{ @ >= -5 && @ <= 9 } * { @ >= -10 && @ <= 5 }", "{ @ >= -90 && @ <= 50 }");
//  test integer division
testSimplify("{ @ >= 10 && @ <= 20 } / { @ >= 5 && @ <= 10 }", "{ @ >= 1 && @ <= 4 }");
testSimplify("{ @ > -10 && @ <= 20 } / { @ >= 5 && @ <= 10 }", "{ @ >= -1 && @ <= 4 }");
testSimplify("{ @ >= 9 && @ <= 20 } / { @ >= 2 && @ <= 4 }", "{ @ >= 2 && @ <= 10 }");
testSimplify("{ @ >= 9 && @ <= 19 } / { @ >= 2 && @ <= 3 }", "{ @ >= 3 && @ <= 9 }");

//  test integer modulus
testSimplify("{ @ >= 10 && @ <= 20 } % { @ >= 5 && @ <= 10 }", "{ @ >= 0 && @ <= 9 }");
testSimplify("{ @ > -10 && @ <= 20 } % { @ >= 5 && @ <= 10 }", "{ @ >= -9 && @ <= 9 }");
//  type integer exponentiation
testSimplify("{ @ >= 0 && @ <= 5 } ** { @ >= 2 && @ <= 3 }", "{ @ >= 0 && @ <= 125 }");
//  -2 ** 2 == 4
//  -2 ** 3 == -8
//  -2 ** 4 == 16
//  -2 ** 5 == -32
//  -2 ** 6 == 64
//  -2 ** 7 == -128
//  -2 ** 8 == 256
testSimplify("{ @ >= -2 && @ <= 1 } ** { @ >= 2 && @ <= 8 }", "{ @ >= -128 && @ <= 256 }");

//  test simplifying types
testSimplify("{ @ > 0.0 } && { @ < 10.0 }", "{ @ > 0.0 && @ < 10.0 }");
testSimplify("{ @ < 10.0 } || { 0.0 < @ }", "{ @ <= POS_INFINITY }");
testSimplify("{ @ >= 0.0 } && { @ <= 0.0 }", "{ @ == 0.0 }");
testSimplify("{ @ < 0.0 } || { @ > 0.0 }", "{ @ != 0.0 }");

testSimplify("{ @ >= 1 }", "{ @ >= 1 }");
testSimplify("{ @ < 2 }", "{ @ <= 1 }");
testSimplify("{ @ >= 1 } && { @ < 2 }", "{(@ == 1)}");

testSimplify("{ @ != 0 || @ == 1 }", "{ @ != 0 }");

testSimplify("{ @ > 0 } || { @ < 0 }", "{ @ != 0 }");
testSimplify("{ @ < 0 } || { @ > 0 }", "{ @ != 0 }");

testSimplify("{ @ == 0 || @ == 1 }", "{ @ >= 0 && @ <= 1 }");
testSimplify("{ @ == 1 || @ == 0 }", "{ @ >= 0 && @ <= 1 }");
testSimplify("{ @ == 2 || @ == 3 || @ == 1 || @ == 0 }", "{ @ >= 0 && @ <= 3 }");

//  test overlapping intervals
testSimplify(
    `{ @ > 0 && @ < 10 || @ > 5 && @ < 20 }`,
    `{((@ >= 1) && (@ <= 19))}`
)

// test overlapping intervals with other properties.
testSimplify(
    `{ @ > 0 && @ < 10 && @.class == "foo" || @ > 5 && @ < 20 && @.class == "foo" && @.bar == "bar" }`,
    `{((((@ >= 1) && (@ <= 19)) && (@.bar == "bar")) && (@.class == "foo"))}`
);

//  stuff
testSimplify(
    `(@ >= -2) && (@ != 0) && (@ <= 0)`,
    `(@ >= -2) && (@ <= -1)`
)

testSimplify(`@ == -10.0 || @ >= -3.0 && @ < 5.0`, `@ == -10.0 || @ >= -3.0 && @ < 5.0`);

//  This should evaluate to false.
testSimplify(`@ >= 0 && @ <= 3 && @ < 0`, `0`);
//  This should evaluate to never.
testSimplify(`{ @ >= 0 && @ <= 3 && @ < 0 }`, `{ 0 }`);

//  TODO:
// testSimplify("{ @ <= 0.0 } && ({ @ >= 0.0 } || { @ == 1.0 })", "{ @ == 0.0 } || { @ == 1.0 }");

//  test simplify of type comparison with other types
testSimplify("{ @ < { @ < 10 } }", "{ @ <= 8 }");
testSimplify("{ @ <= { @ < 10 } }", "{ @ <= 9 }");
testSimplify("{ @ <= { @ <= 10 } }", "{ @ <= 10 }");
testSimplify("{ @ < { @ <= 10 } }", "{ @ <= 9 }");

testSimplify("{ @ > { @ > 10 } }", "{ @ >= 12 }");
testSimplify("{ @ >= { @ > 10 } }", "{ @ >= 11 }");
testSimplify("{ @ >= { @ >= 10 } }", "{ @ >= 10 }");
testSimplify("{ @ > { @ >= 10 } }", "{ @ >= 11 }");

testSimplify(`3 < 5`, `1`);
testSimplify(`4 < 5`, `1`);
testSimplify(`x <= x`, `1`);

testSimplify(`(1 .. 10) < (20 .. 30)`, `1`);
testSimplify(`(1 .. 10) > (20 .. 30)`, `0`);

testSimplify(`{ { @ == 1 } < @ }`, `{ @ >= 2 }`);
testSimplify(`{ { @ == 1 && (@.class == "Integer") } < @ }`, `{ @ >= 2 }`);
testSimplify(`{ { @ == 1 && (@.class == "Integer") } < @ && (@.class == "Integer") }`, `{((@ >= 2) && (@.class == "Integer"))}`);

testSimplify(`({(({(@ == 1)} && {(@.class == "Integer")}) < @)} && {(@.class == "Integer")})`, `{((@ >= 2) && (@.class == "Integer"))}`);

testSimplify(`({(({((@ >= 1) && (@ <= 2))} && {(@.class == "Integer")}) < @)} && {(@.class == "Integer")})`, `{((@ >= 3) && (@.class == "Integer"))}`);

// testSimplify(`1 + x + 3 + x + 4 + x`, `1`);

//  make this work. a value > foo + a positive => a value still > foo
testSimplify(`{ @ > foo && @ >= 1 && @ <= 4 } + { @ == 1 }`, `{ @ >= 2 && @ <= 5 }`);
//                                                                               && @ > foo

testSimplify(`{ @.length == 3 }.length`, `{(@ == 3)}`);
testSimplify(`({((@.length.class == "Integer") && (@.length == 1))} && {(@.class == "Array")}).length`, `{@ == 1 && @.class == "Integer"}`);
