import { strict as assert } from "assert";
import { equals } from "../utility/equals";
import { toTypeExpression } from "../toTypeExpression";
import { parseExpression } from "./parseExpression";

function testToType(allString: string, expectedString: string, toTypeString = "x") {
    let toType = parseExpression(toTypeString);
    let all = parseExpression(allString);
    let expected = parseExpression(expectedString);
    const type = toTypeExpression(all, toType);
    assert(equals(type, expected), `\n${all} => ${toType}\n    expected: ${expected}\n    actual  : ${type}\n`);
}

testToType("12 > x", "{ @ < 12 }");
testToType("12 > x && 12 > y && 12 > z && 5 < x", "{ @ > 5 && @ < 12 }");
testToType("12 > x && foo(x) > y && 12 > z && 5 < x", "{ @ > 5 && @ < 12 && foo(@) > y }");
testToType("foo(x, 1) && foo(y, 2) && foo(z, 3)", "{ foo(@, 1) }");
