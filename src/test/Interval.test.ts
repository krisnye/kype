import { strict as assert } from "assert";
import { parseExpression } from "../parser/parseExpression";
import { joinExpressions } from "../utility/joinExpressions";
import { TypeExpression } from "../expressions/TypeExpression";
import { Interval } from "../expressions/Interval";
import { inferKind } from "../z3/inferKind";

function testInterval(typeString: string, intervalString: string) {
    const expected = parseExpression(intervalString) as Interval<number | bigint>; 
    const t = parseExpression(typeString) as TypeExpression;
    const actual = inferKind(joinExpressions(Interval.fromOrType(t), "||"));
    assert.deepEqual(actual, expected);
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
