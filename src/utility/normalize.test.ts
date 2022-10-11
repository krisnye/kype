import { strict as assert } from "assert";
import { BinaryExpression } from "../expressions/BinaryExpression";
import { Expression } from "../expressions/Expression";
import { Literal } from "../expressions/Literal";
import { Reference } from "../expressions/Reference";
import { normalize } from "./normalize";

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

assert.deepEqual(
    normalize(b(
        b("foo", "||", 10),
        "+",
        b("foo", "&&", 10),
    )),
    b(
        b("foo", "&&", 10),
        "+",
        b("foo", "||", 10),
    )
)

assert.deepEqual(
    normalize(b(
        b("foo", "&&", 10),
        "&&",
        b("foo", "||", 10),
    )),
    b(
        b("foo", "&&", 10),
        "&&",
        b("foo", "||", 10),
    )
)

assert.deepEqual(
    normalize(b(
        b("foo", "||", 10),
        "&&",
        b("foo", "&&", 10),
    )),
    b(
        b("foo", "&&", 10),
        "&&",
        b("foo", "||", 10),
    )
)

assert.deepEqual(
    normalize(b(10, "==", "foo")),
    b("foo", "==", 10)
)

assert.deepEqual(
    normalize(b("foo", "==", "bar")),
    b("bar", "==", "foo")
)

assert.deepEqual(
    normalize(b("foo", "!=", "bar")),
    b("bar", "!=", "foo")
)

assert.deepEqual(
    normalize(b("foo", ">", "bar")),
    b("bar", "<=", "foo")
)

assert.deepEqual(
    normalize(b("foo", ">=", "bar")),
    b("bar", "<", "foo")
)

assert.deepEqual(
    normalize(b("foo", "<", "bar")),
    b("bar", ">=", "foo")
)

assert.deepEqual(
    normalize(b("foo", "<=", "bar")),
    b("bar", ">", "foo")
)
