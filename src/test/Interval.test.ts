import { strict as assert } from "assert";
import { parseExpression } from "./parseExpression";
import { joinExpressions } from "../utility/joinExpressions";
import { TypeExpression } from "../expressions/TypeExpression";
import { Interval } from "../expressions/Interval";

function testInterval(typeString: string, intervalString: string) {
    const expected = parseExpression(intervalString) as Interval<number | bigint>; 
    const t = parseExpression(typeString) as TypeExpression;
    const actual = joinExpressions(Interval.fromType(t), "||");
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
testInterval("{ @ > 10 && @ < 20 }", "10 <..< 20");
