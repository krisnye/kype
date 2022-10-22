import { strict as assert } from "assert";
import { normalize } from "../normalize";
import { parseExpression } from "./parseExpression";

function testNormalize(propositionString: string, normalizedString: string) {
    const p = parseExpression(propositionString);
    const n = parseExpression(normalizedString);
    const normalizedP = normalize(p);
    assert.equal(normalizedP.toString(), n.toString());
}

testNormalize("(foo || 10) + (foo && 10)", "(foo && 10) + (foo || 10)")
testNormalize("(foo && 10) && (foo || 20)", "(foo || 20) && foo && 10")
testNormalize("(foo || 10) && (foo && 10)", "(foo || 10) && foo && 10")
testNormalize("10 == foo", "foo == 10")
testNormalize("foo == bar", "bar == foo")
testNormalize("foo != bar", "bar != foo")
testNormalize("foo >= bar", "bar <= foo")
testNormalize("foo > bar", "bar < foo")
testNormalize("foo <= bar", "bar >= foo")
testNormalize("foo < bar", "bar > foo")
testNormalize("-4 < x", "x > -4")
testNormalize(
    "x < 120 && x < 20 && x < 112 && 12 > x && 15 > x && -4 > x",
    "x < -4 && x < 12 && x < 15 && x < 20 && x < 112 && x < 120"
)

testNormalize("foo < @ && bar > @ && 14 > @", "@ < bar && @ > foo && @ < 14");