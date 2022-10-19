import { strict as assert } from "assert";
import { BinaryExpression } from "../expressions/BinaryExpression";
import { CallExpresssion } from "../expressions/CallExpression";
import { Literal } from "../expressions/Literal";
import { Reference } from "../expressions/Reference";
import { parseExpression } from "./parseExpression";

assert.deepEqual(
    parseExpression("x + 10 * 2"),
    new BinaryExpression(
        new Reference("x"),
        "+",
        new BinaryExpression(
            new Literal(10),
            "*",
            new Literal(2)
        )
    )
)

assert.deepEqual(
    parseExpression("foo(1, 2, 3)"),
    new CallExpresssion(
        new Reference("foo"),
        [new Literal(1), new Literal(2), new Literal(3)]
    )
)