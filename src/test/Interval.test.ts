import { strict as assert } from "assert";
import { TypeExpression } from "../expressions/TypeExpression";
import { Interval } from "../expressions/Interval";
import { parseExpression } from "./parseExpression";

function testInterval(typeString: string, intervalString: string) {
    const expected = parseExpression(intervalString) as Interval; 
    const t = parseExpression(typeString) as TypeExpression;
    const actual = Interval.fromType(t);
    assert.deepEqual(actual, expected);
}

testInterval("{ @ > 10 && @ < 20 }", "10 <..< 20");
testInterval("{ @ >= 10 && @ <= 20 }", "10 .. 20");
testInterval("{ @ > 10 && @ <= 20 }", "10 <.. 20");
testInterval("{ @ >= 10 && @ < 20 }", "10 ..< 20");

testInterval("{ @ > NEG_INFINITY && @ <= 20 }", "NEG_INFINITY .. 20");
testInterval("{ @ > 0 && @ < POS_INFINITY }", "0 <.. POS_INFINITY");
testInterval("{ @ > NEG_INFINITY && @ < POS_INFINITY }", "NEG_INFINITY .. POS_INFINITY");
testInterval("{ @ >= NEG_INFINITY && @ <= POS_INFINITY }", "NEG_INFINITY .. POS_INFINITY");
