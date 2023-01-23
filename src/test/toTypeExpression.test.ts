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

testToType("12.0 > x", "{ @ < 12.0 }");
testToType("12.0 > x && 12.0 > y && 12.0 > z && 5.0 < x", "{ @ > 5.0 && @ < 12.0 }");
testToType("12.0 > x && foo(x) > y && 12.0 > z && 5.0 < x", "{ @ > 5.0 && @ < 12.0 && foo(@) > y }");
testToType("foo(x, 1.0) && foo(y, 2.0) && foo(z, 3.0)", "{ foo(@, 1.0) }");
