import { strict as assert } from "assert";
import { BinaryExpression } from "../expressions/BinaryExpression";
import { CallExpresssion } from "../expressions/CallExpression";
import { Expression } from "../expressions/Expression";
import { Literal } from "../expressions/Literal";
import { Reference } from "../expressions/Reference";
import { negate } from "../utility/negate";
import { normalize } from "../utility/normalize";
import { isConsequent } from "./isConsequent";
import { simplify } from "./simplify";

function e(expr: string): Reference
function e(expr: number): Literal
function e(expr: string | number | Expression): Expression
function e(expr: string | number | Expression) {
    if (!(expr instanceof Expression)) {
        expr = typeof expr === 'string' ? new Reference(expr) : new Literal(expr);
    }
    return expr;
}
function b(left: string | number | Expression, operator: string, right: string | number | Expression) {
    left = e(left);
    right = e(right);
    return new BinaryExpression(left, operator, right);
}
function c(callee: any, ...args: Array<string | number | Expression>) {
    return new CallExpresssion(e(callee), args.map(e));
}
function not(a: any) {
    return negate(e(a));
}
type E = string | number | Expression
function and(A: E, B: E) {
    return b(A, "&&", B);
}
function or(A: E, B: E) {
    return b(A, "||", B);
}
function is(A: E, B: E) {
    return b(A, "is", B);
}
function testConsequent(a: Expression, b: Expression, ab_expected: true | false | null, ba_expected: true | false | null) {
    const ab_actual = isConsequent(a, b);
    const ba_actual = isConsequent(b, a);
    assert.equal(ab_actual, ab_expected, `\n${a} => ${b}, expected ${ab_expected}, actual: ${ab_actual}`);
    assert.equal(ba_actual, ba_expected, `\n${b} => ${a}, expected ${ba_expected}, actual: ${ba_actual}`);
}

testConsequent(b("foo", ">", 1), b("foo", ">", 0), true, null);
testConsequent(b("foo", "<", 1), b("foo", "<", 2), true, null);
testConsequent(b("foo", ">=", 1), b("foo", ">=", 0), true, null);
testConsequent(b("foo", "<=", 1), b("foo", "<=", 2), true, null);
testConsequent(b("foo", ">", 0), b("foo", ">", 0), true, true);
testConsequent(b("foo", ">", 0), b("foo", "<", 0), false, false);
testConsequent(b("foo", ">=", 0), b("foo", "<", 0), false, false);
testConsequent(b("foo", ">=", 0), b("foo", "<=", 0), null, null);
testConsequent(b("foo", "<", 0), b("foo", "!=", 0), true, null);
testConsequent(b("foo", ">", 0), b("foo", "!=", 0), true, null);
testConsequent(b("foo", "==", 0), b("foo", "<=", 0), true, null);
testConsequent(b("foo", "==", 0), b("foo", ">=", 0), true, null);
testConsequent(b("foo", "==", "x"), b("foo", ">=", "x"), true, null);
testConsequent(b("foo", "==", "x"), b("foo", "<=", "x"), true, null);
testConsequent(b("foo", "==", "x"), b("foo", ">", "x"), false, false);
testConsequent(b("foo", "==", "x"), b("foo", "<", "x"), false, false);
testConsequent(b("foo", ">", "x"), b("foo", ">=", "x"), true, null);
testConsequent(b("foo", "<", "x"), b("foo", "<=", "x"), true, null);
testConsequent(b("foo", "<", "x"), b("foo", "!=", "x"), true, null);
testConsequent(b("foo", ">", 0), b("foo", "!=", 0), true, null);
testConsequent(
    b(b("foo", "<", "x"), "||", b("foo", ">", "x")),
    b("foo", "!=", "x"),
    true,
    null    // although conceptually, != x implies > x | < x, our analysis does not recognize this.
    //  It SHOULD with proper range analysis.
);

testConsequent(
    b(b("foo", ">", 0), "&&", b("foo", "<", 10)),
    b(b("foo", ">", 1), "&&", b("foo", "<", 8)),
    null,
    true
);

testConsequent(
    b(b("foo", ">", 0), "||", b("foo", "<", 10)),
    b(b("foo", ">", 1), "||", b("foo", "<", 8)),
    null,
    true
);
testConsequent(
    b(b("foo", ">", 0), "||", b("foo", "<", 10)),
    b(b("foo", ">", 1), "&&", b("foo", "<", 8)),
    null,
    true
);
testConsequent(
    b(c("foo", 1, 2), "&&", c("bar", 3, 4)),
    c("foo", 1, 2),
    true,
    null
);

// simplify Expressions test

function testSimplify(input: Expression, expected: Expression) {
    let actual = simplify(input);
    let as = actual.toString();
    let es = expected.toString();
    assert(as === es, `simplify(${input}), expected: ${es}, actual: ${as}`);
}

const A = e("A");
const B = e("B");
const C = e("C");
const D = e("D");
const E = e("E");

testSimplify(or(and(A, B), B), B);
testSimplify(or(and(A, A), A), A);
testSimplify(or(B, and(A, B)), B);
testSimplify(or(A, and(A, B)), A);

testSimplify(or(or(A, B), B), or(A, B));
testSimplify(or(A, or(B, A)), or(A, B));

testSimplify(and(or(A, B), A), A);
testSimplify(and(A, or(A, B)), A);

testSimplify(and(or(A, B), B), B);

testSimplify(and(or(A, B), not(A)), and(not(A), B));
testSimplify(and(or(or(A, B), C), not(B)), and(not(B), or(A, C)));
testSimplify(and(or(A, or(B, C)), not(B)), and(not(B), or(A, C)));

// test simplify 
testSimplify(b(10, "==", A), b(A, "==", 10));
// make sure 'is' operator is not sorted
testSimplify(is(10, A), is(10, A));
