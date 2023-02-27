import { strict as assert } from "assert";
import { isConsequentAsync } from "../isConsequent";
import { parseExpression } from "../parser/parseExpression";
import { initZ3Context } from "../z3/toZ3";

async function testConsequent(astring: string, bstring: string, ab_expected: true | false | null) {
    const a = parseExpression(astring);
    const b = parseExpression(bstring);
    const ab_actual = await isConsequentAsync(a, b);
    // const ba_actual = await isConsequentAsync(b, a);
    assert.equal(ab_actual, ab_expected, `\n${a} => ${b}, expected ${ab_expected}, actual: ${ab_actual}`);
    // assert.equal(ba_actual, ba_expected, `\n${b} => ${a}, expected ${ba_expected}, actual: ${ba_actual}`);
}

export async function testIsConsequent() {
    await initZ3Context();

    await testConsequent("foo > 1.0", "foo > 0.0", true);
    await testConsequent("foo < 1.0", "foo < 2.0", true);
    await testConsequent("foo >= 1.0", "foo >= 0.0", true);
    await testConsequent("foo <= 1.0", "foo <= 2.0", true);
    await testConsequent("foo > 0.0", "foo > 0.0", true);
    await testConsequent("foo > 0.0", "foo < 0.0", false);
    await testConsequent("foo >= 0.0", "foo < 0.0", false);
    await testConsequent("foo >= 0.0", "foo <= 0.0", null);
    await testConsequent("foo < 0.0", "foo != 0.0", true);
    await testConsequent("foo > 0.0", "foo != 0.0", true);
    await testConsequent("foo == 0.0", "foo <= 0.0", true);
    await testConsequent("foo == 0.0", "foo >= 0.0", true);
    
    await testConsequent("foo == x", "foo >= x", true);
    await testConsequent("foo == x", "foo <= x", true);
    await testConsequent("foo == x", "foo > x", false);
    await testConsequent("foo == x", "foo < x", false);
    await testConsequent("foo > x", "foo >= x", true);
    await testConsequent("foo < x", "foo <= x", true);
    await testConsequent("foo < x", "foo != x", true);
    await testConsequent("foo > 0.0", "foo != 0.0", true);
    
    await testConsequent("foo < x || foo > x", "foo != x", true);
    
    await testConsequent("foo > 0.0 && foo < 100.0", "foo > 1.0 && foo < 8.0", null);
    //  these both simplify to foo is Number
    await testConsequent("foo > 0.0 || foo < 100.0", "foo > 1.0 || foo < 8.0", true);
    await testConsequent("foo == bar", "foo == baz", null);
    await testConsequent("foo == 0.0", "foo == 1.0", false);
    
    await testConsequent("foo > 0.0 || foo < 100.0", "foo > 1.0 && foo < 8.0", null);
    
    //  test types with string
    await testConsequent(`a == "foo"`, `a == "bar"`, false);
    await testConsequent(`a == "foo"`, `a != "foo"`, false);

    //  test stuff
    await testConsequent(`{ @ <= -1 }`, `{ @ >= 0 && @ <= 2 }`, false);
    
    //  test which can only be solved by z3
    await testConsequent(`a > b && b > c`, `a > c`, true);
    await testConsequent(`a > b && b > c && c > d`, `a > d`, true);
}
