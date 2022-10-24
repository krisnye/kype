import { strict as assert } from "assert";
import { negate } from "../negate";
import { normalize } from "../normalize";
import { parseExpression } from "./parseExpression";

function testNegate(propositionString: string, negateString: string) {
    const p = parseExpression(propositionString);
    const n = parseExpression(negateString);
    const notP = negate(p);
    assert.equal(notP.toString(), n.toString());
    const notNotP = negate(notP);
    assert.equal(normalize(p).toString(), normalize(notNotP).toString())
}

testNegate("foo", "!foo");
testNegate("foo == bar", "foo != bar");
testNegate("foo < bar", "foo >= bar");
testNegate("foo > bar", "foo <= bar");
testNegate("foo <= bar", "foo > bar");
testNegate("foo >= bar", "foo < bar");
// testNegate("foo is Bar", "foo isnt Bar");
// testNegate("foo isnt Bar", "foo is Bar");