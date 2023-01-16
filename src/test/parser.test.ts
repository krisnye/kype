import { strict as assert } from "assert";
import { BinaryExpression } from "../expressions/BinaryExpression";
import { CallExpresssion } from "../expressions/CallExpression";
import { NumberLiteral } from "../expressions/NumberLiteral";
import { Reference } from "../expressions/Reference";
import { parseExpression } from "./parseExpression";

assert.deepEqual(
    parseExpression("x + 10 * 2"),
    new BinaryExpression(
        new Reference("x"),
        "+",
        new BinaryExpression(
            new NumberLiteral(10),
            "*",
            new NumberLiteral(2)
        )
    )
)

assert.deepEqual(
    parseExpression("foo(1, 2, 3)"),
    new CallExpresssion(
        new Reference("foo"),
        [new NumberLiteral(1), new NumberLiteral(2), new NumberLiteral(3)]
    )
)