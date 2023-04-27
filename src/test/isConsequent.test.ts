import { strict as assert } from "assert";
import { isConsequent } from "../isConsequent";
import { parseExpression } from "../parser/parseExpression";

function testConsequent(astring: string, bstring: string, ab_expected: true | false | null) {
    const a = parseExpression(astring);
    const b = parseExpression(bstring);
    const ab_actual = isConsequent(a, b);
    assert.equal(ab_actual, ab_expected, `\n${a} => ${b}, expected ${ab_expected}, actual: ${ab_actual}`);
}

export function testIsConsequent() {
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

    //  transitive logic.
    testConsequent(`a > b && b > c`, `a > c`, true);
    testConsequent(`a > b && b > c && c > d`, `a > d`, true);
    testConsequent(`a > b && b > c`, `a < c`, false);
    testConsequent(`a > b && b > c`, `a == c`, false);
    testConsequent(`a > b && b >= c`, `a > c`, true);
    testConsequent(`a >= b && b > c`, `a > c`, true);
    testConsequent(`a >= b && b >= c`, `a > c`, null);
    testConsequent(`a >= b && b > c && c >= d`, `a > d`, true);
    testConsequent(`a >= b && b > c && c >= d`, `a <= d`, false);

}
