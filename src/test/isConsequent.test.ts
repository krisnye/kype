import { strict as assert } from "assert";
import { isConsequentAsync, isConsequent } from "../isConsequent";
import { parseExpression } from "../parser/parseExpression";
import { initZ3Context } from "../z3/toZ3";

function testConsequent(astring: string, bstring: string, ab_expected: true | false | null) {
    const a = parseExpression(astring);
    const b = parseExpression(bstring);
    const ab_actual = isConsequent(a, b);
    // const ba_actual = isConsequentAsync(b, a);
    assert.equal(ab_actual, ab_expected, `\n${a} => ${b}, expected ${ab_expected}, actual: ${ab_actual}`);
    // assert.equal(ba_actual, ba_expected, `\n${b} => ${a}, expected ${ba_expected}, actual: ${ba_actual}`);
}

export function testIsConsequent() {
    // initZ3Context();

    testConsequent("foo > 1.0", "foo > 0.0", true);
    testConsequent("foo < 1.0", "foo < 2.0", true);
    testConsequent("foo >= 1.0", "foo >= 0.0", true);
    testConsequent("foo <= 1.0", "foo <= 2.0", true);
    testConsequent("foo > 0.0", "foo > 0.0", true);
    testConsequent("foo > 0.0", "foo < 0.0", false);
    testConsequent("foo >= 0.0", "foo < 0.0", false);
    testConsequent("foo >= 0.0", "foo <= 0.0", null);
    testConsequent("foo < 0.0", "foo != 0.0", true);
    testConsequent("foo > 0.0", "foo != 0.0", true);
    testConsequent("foo == 0.0", "foo <= 0.0", true);
    testConsequent("foo == 0.0", "foo >= 0.0", true);
    
    testConsequent("foo == x", "foo >= x", true);
    testConsequent("foo == x", "foo <= x", true);
    testConsequent("foo == x", "foo > x", false);
    testConsequent("foo == x", "foo < x", false);
    testConsequent("foo > x", "foo >= x", true);
    testConsequent("foo < x", "foo <= x", true);
    testConsequent("foo < x", "foo != x", true);
    testConsequent("foo > 0.0", "foo != 0.0", true);
    
    testConsequent("foo < x || foo > x", "foo != x", true);
    
    testConsequent("foo > 0.0 && foo < 100.0", "foo > 1.0 && foo < 8.0", null);
    //  these both simplify to foo is Number
    testConsequent("foo > 0.0 || foo < 100.0", "foo > 1.0 || foo < 8.0", true);
    testConsequent("foo == bar", "foo == baz", null);
    testConsequent("foo == 0.0", "foo == 1.0", false);
    
    testConsequent("foo > 0.0 || foo < 100.0", "foo > 1.0 && foo < 8.0", null);
    
    //  test types with string
    testConsequent(`a == "foo"`, `a == "bar"`, false);
    testConsequent(`a == "foo"`, `a != "foo"`, false);

    //  test stuff
    testConsequent(`{ @ <= -1 }`, `{ @ >= 0 && @ <= 2 }`, false);

    testConsequent(`@ >= -3.0 && @ < 5.0`, `@ == -10.0 || @ == -20 || @ >= -3.0 && @ < 5.0`, true);

    testConsequent(
        `@ >= -3.0 && @ < 5.0 && A`,
        `(@ == -10.0 || @ >= -3.0 && @ < 5.0) && A`,
        true
    );

    //  --> 

    //  test which can only be solved by z3
    //  add transitive logic.
    testConsequent(`a > b && b > c`, `a > c`, true);
    // testConsequent(`a > b && b > c && c > d`, `a > d`, true, true);
}
