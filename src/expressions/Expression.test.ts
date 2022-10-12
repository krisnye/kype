import { strict as assert } from "assert";
import { BinaryExpression } from "./BinaryExpression";
import { Literal } from "./Literal";
import { Reference } from "./Reference";

const e = new BinaryExpression(new Reference("a"), "<", new Literal(12));
assert.deepEqual(
    e.replace(new Literal(12), new Reference("b")),
    new BinaryExpression(new Reference("a"), "<", new Reference("b"))
)
