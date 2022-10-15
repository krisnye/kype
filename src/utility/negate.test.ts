import { strict as assert } from "assert";
import { BinaryExpression } from "../expressions/BinaryExpression";
import { ComparisonOperator, LogicalOperator } from "../expressions/BinaryOperator";
import { Reference } from "../expressions/Reference";
import { UnaryExpression } from "../expressions/UnaryExpression";
import { UnaryOperator } from "../expressions/UnaryOperator";
import { negate } from "./negate";

const foo = new Reference("foo");
const bar = new Reference("bar");

assert.deepEqual(
    negate(foo),
    new UnaryExpression(UnaryOperator.not, foo)
);

assert.deepEqual(
    negate(negate(foo)),
    foo
);

assert.deepEqual(
    negate(new BinaryExpression(foo, ComparisonOperator.equality, bar)),
    new BinaryExpression(foo, ComparisonOperator.inequality, bar)
)

assert.deepEqual(
    negate(new BinaryExpression(foo, ComparisonOperator.lessThan, bar)),
    new BinaryExpression(foo, ComparisonOperator.greaterThanOrEqual, bar)
)

assert.deepEqual(
    negate(new BinaryExpression(foo, ComparisonOperator.greaterThan, bar)),
    new BinaryExpression(foo, ComparisonOperator.lessThanOrEqual, bar)
)

assert.deepEqual(
    negate(new BinaryExpression(foo, ComparisonOperator.lessThanOrEqual, bar)),
    new BinaryExpression(foo, ComparisonOperator.greaterThan, bar)
)

assert.deepEqual(
    negate(new BinaryExpression(foo, ComparisonOperator.greaterThanOrEqual, bar)),
    new BinaryExpression(foo, ComparisonOperator.lessThan, bar)
)
