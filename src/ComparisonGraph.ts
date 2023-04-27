import { BinaryExpression, Expression } from "./expressions";
import { Maybe } from "./isConsequent";
import { memoize } from "./utility";

const transitiveOperators = {
    "==": { positive: ["=="], negative: ["<", ">"], reverse: "==", unequal: false },
    "<":  { positive: ["<=", "<", "=="], negative: ["==", ">", ">="], reverse: ">=", unequal: true },
    ">":  { positive: [">=", ">", "=="], negative: ["==", "<", "<="], reverse: "<=", unequal: true },
    "<=": { positive: ["<=", "<", "=="], negative: [">"], reverse: ">", unequal: false },
    ">=": { positive: [">=", ">", "=="], negative: ["<"], reverse: "<", unequal: false },
} as const;

const transitiveOperatorsRecurse = {
    "==": "==",
    "<": "<=",
    ">": ">=",
    "<=": "<=",
    ">=": ">=",
} as const;

type TransitiveOperator = keyof typeof transitiveOperators;

export function isTransitiveOperator(op: string): op is TransitiveOperator {
    return transitiveOperators[op as TransitiveOperator] != null;
}

export class ComparisonGraph {

    public readonly "==" = new Set<ComparisonGraph>();
    public readonly "<" = new Set<ComparisonGraph>();
    public readonly ">" = new Set<ComparisonGraph>();
    public readonly "<=" = new Set<ComparisonGraph>();
    public readonly ">=" = new Set<ComparisonGraph>();

    constructor(
        public readonly stringValue: string,
    ) {
    }

    /**
     * @returns -1 if no right expression,
     * >= 0 if right expression and value is how many of the intermediate operators were unequal operators,
     */
    private getRightExpressionUnequalCount(op: TransitiveOperator, rightString: string, unequalCount = 0): number {
        const ops = transitiveOperators[op];
        for (const otherOp of ops.positive) {
            const newUnequalCount = unequalCount + (transitiveOperators[otherOp].unequal ? 1 : 0);
            for (const other of this[otherOp]) {
                if (other.stringValue === rightString) {
                    return newUnequalCount;
                }
                // recurse, but only the first time we find this value.
                const recurseOp = transitiveOperatorsRecurse[op];
                const recurseValue = other.getRightExpressionUnequalCount(recurseOp, rightString, newUnequalCount);
                if (recurseValue !== null) {
                    return recurseValue;
                }
            }
        }
        return -1;
    }

    private hasRightExpression(op: TransitiveOperator, rightString: string): boolean {
        const unequalCount = this.getRightExpressionUnequalCount(op, rightString);
        if (unequalCount >= 0) {
            if (transitiveOperators[op].unequal) {
                if (unequalCount > 0) {
                    return true;
                }
            }
            else {
                return true;
            }
        }
        return false;
    }

    isConsequent(op: TransitiveOperator, right: Expression): Maybe {
        const rightString = right.toString();
        if (this.hasRightExpression(op, rightString)) {
            return true;
        }
        for (const negateOp of transitiveOperators[op].negative) {
            if (this.hasRightExpression(negateOp, rightString)) {
                return false;
            }
        }
        return null;
    }

}

export const getComparisonGraphMap = memoize((root: Expression): Map<string,ComparisonGraph> => {
    const graphs = new Map<string,ComparisonGraph>();
    function getGraph(e: Expression) {
        const stringValue = e.toString();
        let graph = graphs.get(stringValue);
        if (!graph) {
            graphs.set(stringValue, graph = new ComparisonGraph(stringValue));
        }
        return graph;
    }
    for (let e of root.split("&&")) {
        if (e instanceof BinaryExpression && isTransitiveOperator(e.operator)) {
            let aGraph = getGraph(e.left);
            let bGraph = getGraph(e.right);
            aGraph[e.operator].add(bGraph);
            bGraph[transitiveOperators[e.operator].reverse].add(aGraph);
        }
    }
    return graphs;
});