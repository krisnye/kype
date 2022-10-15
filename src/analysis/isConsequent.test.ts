import { strict as assert } from "assert";
import { Expression } from "../expressions/Expression";
import { b, c } from "../utility/testUtils";
import { isConsequent } from "./isConsequent";


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