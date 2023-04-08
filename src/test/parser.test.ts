import { strict as assert } from "assert";
import { ExpressionKind } from "../expressions";
import { BinaryExpression } from "../expressions/BinaryExpression";
import { NumberLiteral } from "../expressions/NumberLiteral";
import { Reference } from "../expressions/Reference";
import { parseExpression } from "../parser/parseExpression";

// assert.deepEqual(
//     parseExpression("x + 10 * 2"),
//     new BinaryExpression(
//         new Reference("x", ExpressionKind.Integer),
//         "+",
//         new BinaryExpression(
//             new NumberLiteral(10n),
//             "*",
//             new NumberLiteral(2n),
//             ExpressionKind.Integer
//         ),
//         ExpressionKind.Integer
//     )
// )

// assert.deepEqual(
//     parseExpression("x + 10.0 * 2.0"),
//     new BinaryExpression(
//         new Reference("x", ExpressionKind.Float),
//         "+",
//         new BinaryExpression(
//             new NumberLiteral(10),
//             "*",
//             new NumberLiteral(2),
//             ExpressionKind.Float
//         ),
//         ExpressionKind.Float
//     )
// )
