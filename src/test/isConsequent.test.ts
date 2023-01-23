import { strict as assert } from "assert";
import { isConsequent } from "../isConsequent";
import { parseExpression } from "./parseExpression";

function testConsequent(astring: string, bstring: string, ab_expected: true | false | null, ba_expected: true | false | null) {
    const a = parseExpression(astring);
    const b = parseExpression(bstring);
    const ab_actual = isConsequent(a, b);
    const ba_actual = isConsequent(b, a);
    assert.equal(ab_actual, ab_expected, `\n${a} => ${b}, expected ${ab_expected}, actual: ${ab_actual}`);
    assert.equal(ba_actual, ba_expected, `\n${b} => ${a}, expected ${ba_expected}, actual: ${ba_actual}`);
}

testConsequent("foo > 1.0", "foo > 0.0", true, null);
testConsequent("foo < 1.0", "foo < 2.0", true, null);
testConsequent("foo >= 1.0", "foo >= 0.0", true, null);
testConsequent("foo <= 1.0", "foo <= 2.0", true, null);
testConsequent("foo > 0.0", "foo > 0.0", true, true);
testConsequent("foo > 0.0", "foo < 0.0", false, false);
testConsequent("foo >= 0.0", "foo < 0.0", false, false);
testConsequent("foo >= 0.0", "foo <= 0.0", null, null);
testConsequent("foo < 0.0", "foo != 0.0", true, null);
testConsequent("foo > 0.0", "foo != 0.0", true, null);
testConsequent("foo == 0.0", "foo <= 0.0", true, null);
testConsequent("foo == 0.0", "foo >= 0.0", true, null);

testConsequent("foo == x", "foo >= x", true, null);
testConsequent("foo == x", "foo <= x", true, null);
testConsequent("foo == x", "foo > x", false, false);
testConsequent("foo == x", "foo < x", false, false);
testConsequent("foo > x", "foo >= x", true, null);
testConsequent("foo < x", "foo <= x", true, null);
testConsequent("foo < x", "foo != x", true, null);
testConsequent("foo > 0.0", "foo != 0.0", true, null);

testConsequent("foo < x || foo > x", "foo != x", true, true);

testConsequent("foo > 0.0 && foo < 100.0", "foo > 1.0 && foo < 8.0", null, true);
//  these both simplify to foo is Number
testConsequent("foo > 0.0 || foo < 100.0", "foo > 1.0 || foo < 8.0", true, true);
testConsequent("foo(1.0, 2.0) && bar(3, 4)", "foo(1.0, 2.0)", true, null);
testConsequent("foo == bar", "foo == baz", null, null);
testConsequent("foo == 0.0", "foo == 1.0", false, false);
// testConsequent("foo is Bar", "foo is Baz", false, false);
// testConsequent("foo is Bar", "foo isnt Bar", false, false);

testConsequent("foo > 0.0 || foo < 100.0", "foo > 1.0 && foo < 8.0", null, true);

//  test types with string
testConsequent(`a == "foo"`, `a == "bar"`, false, false);
testConsequent(`a == "foo"`, `a != "foo"`, false, false);