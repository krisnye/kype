import { traverse } from "@glas/traverse";
import { BinaryExpression, Expression, ExpressionKind, isComparisonOperator, isLogicalOperator, isMathOperator } from "../expressions";

export function inferKind<T extends Expression>(root: T): T {
    const nameToType = new Map<string,ExpressionKind>();
    // traverse once to find types
    traverse(root, {
        skip(node) {
            return !(node instanceof Expression || Array.isArray(node));
        },
        leave(node) {
            if (node instanceof BinaryExpression) {
                let kind: ExpressionKind = ExpressionKind.Unknown;
                if (isLogicalOperator(node.operator)) {
                    kind = ExpressionKind.Boolean;
                }
                if (isComparisonOperator(node.operator) || isMathOperator(node.operator)) {
                    kind = node.right.kind || node.left.kind;
                }
                if (kind) {
                    node.kind = kind;
                    node.left.kind ||= kind;
                    node.right.kind ||= kind;
                    nameToType.set(node.left.toString(), kind);
                    nameToType.set(node.right.toString(), kind);
                }
            }
        }
    });
    //  traverse again to replace types
    traverse(root, {
        leave(node) {
            if (node instanceof Expression && node.kind === ExpressionKind.Unknown) {
                node.kind = nameToType.get(node.toString()) ?? ExpressionKind.Integer;
            }
        }
    })
    return root;
}