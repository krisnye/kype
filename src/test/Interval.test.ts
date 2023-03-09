import { strict as assert } from "assert";
import { parseExpression } from "../parser/parseExpression";
import { TypeExpression } from "../expressions/TypeExpression";
import { Interval } from "../expressions/Interval";
// import { inferKind } from "../z3/inferKind";

function testInterval(typeString: string, intervalStrings: string) {
    const expected = intervalStrings.split(",").map(i => parseExpression(i.trim()));
    const t = parseExpression(typeString) as TypeExpression;
    const actual = Interval.fromOrType(t);
    let as = actual.toString();
    let es = expected.toString();
    assert(as === es, `testInterval(${typeString}), expected: ${es}, actual: ${as}`);
}

//  test float based ranges
testInterval("{ @ > 10.0 && @ < 20.0 }", "10.0 <..< 20.0");
testInterval("{ @ >= 10.0 && @ <= 20.0 }", "10.0 .. 20.0");
testInterval("{ @ > 10.0 && @ <= 20.0 }", "10.0 <.. 20.0");
testInterval("{ @ >= 10.0 && @ < 20.0 }", "10.0 ..< 20.0");

testInterval("{ @ > NEG_INFINITY && @ <= 20.0 }", "NEG_INFINITY .. 20.0");
testInterval("{ @ > 0.0 && @ < POS_INFINITY }", "0.0 <.. POS_INFINITY");
testInterval("{ @ > NEG_INFINITY && @ < POS_INFINITY }", "NEG_INFINITY .. POS_INFINITY");
testInterval("{ @ >= NEG_INFINITY && @ <= POS_INFINITY }", "NEG_INFINITY .. POS_INFINITY");

testInterval("{ @ == 10.0 }", "10.0 .. 10.0");

//  test big integer based ranges
testInterval(`{ @ > 10 && @ < 20 && @.class == "Integer"}`, "10 <..< 20");

//  test splitting intervals by including != values.
//  integers
testInterval(`{ @ >= -2 && @ != 0 && @ <= 1 }`, "-2 .. -1, 1 .. 1");
testInterval(`{ @ >= -2 && @ != 1 && @ <= 1 }`, "-2 .. 0");
testInterval(`{ @ >= -2 && @ != -2 && @ <= 1 }`, "-1 .. 1");
testInterval(`{ @ >= -2 && @ != 10 && @ <= 1 }`, "-2 .. 1");
testInterval(`{ @ >= 0 && @ != 1 && @ != 6 && @ <= 10 }`, "0 .. 0, 2 .. 5, 7 .. 10");
//  floats
testInterval(`{ @ >= -2.0 && @ != 0.0 && @ <= 1.0 }`, "-2.0 ..< 0.0, 0.0 <.. 1.0");
testInterval(`{ @ >= -2.0 && @ != 1.0 && @ <= 1.0 }`, "-2.0 ..< 1.0");
testInterval(`{ @ >= -2.0 && @ != -2.0 && @ <= 1.0 }`, "-2.0 <.. 1.0");
testInterval(`{ @ >= -2.0 && @ != 10.0 && @ <= 1.0 }`, "-2.0 .. 1.0");
testInterval(`{ @ >= 0.0 && @ != 1.0 && @ != 6.0 && @ <= 10.0 }`, "0.0 ..< 1.0, 1.0 <..< 6.0, 6.0 <.. 10.0");
