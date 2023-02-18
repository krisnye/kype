import { strict as assert } from "assert";
import { normalize } from "../normalize";
import { parseExpression } from "../parser/parseExpression";

function testNormalize(propositionString: string, normalizedString: string) {
    const p = parseExpression(propositionString);
    const n = parseExpression(normalizedString);
    const normalizedP = normalize(p);
    assert.equal(normalizedP.toString(), n.toString());
}

testNormalize("(foo || 10.0) + (foo && 10.0)", "(foo && 10.0) + (foo || 10.0)")
testNormalize("(foo && 10.0) && (foo || 20.0)", "(foo || 20.0) && foo && 10.0")
testNormalize("(foo || 10.0) && (foo && 10.0)", "(foo || 10.0) && foo && 10.0")
testNormalize("10.0 == foo", "foo == 10.0")
testNormalize("foo == bar", "bar == foo")
testNormalize("foo != bar", "bar != foo")
testNormalize("foo >= bar", "bar <= foo")
testNormalize("foo > bar", "bar < foo")
testNormalize("foo <= bar", "bar >= foo")
testNormalize("foo < bar", "bar > foo")
testNormalize("-4.0 < x", "x > -4.0")
testNormalize(
    "x < 120.0 && x < 20.0 && x < 112.0 && 12.0 > x && 15.0 > x && -4.0 > x",
    "x < -4.0 && x < 12.0 && x < 15.0 && x < 20.0 && x < 112.0 && x < 120.0"
)

testNormalize("foo < @ && bar > @ && 14.0 > @", "@ < bar && @ > foo && @ < 14.0");