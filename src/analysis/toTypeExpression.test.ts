import { strict as assert } from "assert";
import { Expression } from "../expressions/Expression";
import { equals } from "../utility/equals";
import { and, b, c, e } from "../utility/testUtils";
import { toTypeExpression } from "./toTypeExpression";

type E = string | number | Expression
function testType(all: Expression, expected: Expression, toType: E = "x") {
    toType = e(toType);
    const type = toTypeExpression(all, toType);
    assert(equals(type, expected), `\n${all} => ${toType}, expected ${expected}, actual: ${type}`);
}

testType(b(12, ">", "x"), b("this", "<", 12));

testType(
    and(
        b(12, ">", "x"),
        b(12, ">", "y"),
        b(12, ">", "z"),
        b(5, "<", "x"),
    ),
    and(
        b("this", "<", 12),
        b("this", ">", 5)
    )
);

testType(
    and(
        b(12, ">", "x"),
        b(c("foo", "x"), ">", "y"),
        b(12, ">", "z"),
        b(5, "<", "x"),
    ),
    and(
        b("this", "<", 12),
        b(c("foo", "this"), ">", "y"),
        b("this", ">", 5),
    )
);


