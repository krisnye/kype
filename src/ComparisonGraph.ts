import { BinaryExpression, Expression } from "./expressions";
import { Maybe } from "./isConsequent";
import { memoize } from "./utility";

export const transitiveOperators = {
    "==": { positive: ["=="], negative: ["<", ">"], reverse: "==", unequal: false, compare(a: any, b: any) { return a === b } },
    //  for <, the chain of <=, <, == will only be accepted if there is at least one < within it (unequal = true)
    "<":  { positive: ["<=", "<", "=="], negative: ["==", ">", ">="], reverse: ">=", unequal: true, compare(a: any, b: any) { return a < b } },
    //  for >, the chain of >=, >, == will only be accepted if there is at least one > within it (unequal = true)
    ">":  { positive: [">=", ">", "=="], negative: ["==", "<", "<="], reverse: "<=", unequal: true, compare(a: any, b: any) { return a > b } },
    "<=": { positive: ["<=", "<", "=="], negative: [">"], reverse: ">", unequal: false, compare(a: any, b: any) { return a <= b } },
    ">=": { positive: [">=", ">", "=="], negative: ["<"], reverse: "<", unequal: false, compare(a: any, b: any) { return a >= b } },
} as const;

type TransitiveOperator = keyof typeof transitiveOperators;

export function isTransitiveOperator(op: string): op is TransitiveOperator {
    return transitiveOperators[op as TransitiveOperator] != null;
}

export class ComparisonGraph {

    public readonly stringValue: string;
    public readonly "==" = new Set<ComparisonGraph>();
    public readonly "<" = new Set<ComparisonGraph>();
    public readonly ">" = new Set<ComparisonGraph>();
    public readonly "<=" = new Set<ComparisonGraph>();
    public readonly ">=" = new Set<ComparisonGraph>();

    constructor(
        public readonly expression: Expression,
    ) {
        this.stringValue = expression.toString();
    }

    /**
     * @returns -1 if no right expression,
     * >= 0 if right expression and value is how many of the intermediate operators were unequal operators,
     */
    private getRightExpressionUnequalCount(op: TransitiveOperator, rightString: string, unequalCount = 0, traversed = new Set<string>()): number {
        if (!traversed.has(this.stringValue)) {
            traversed.add(this.stringValue);
            const ops = transitiveOperators[op];
            for (const otherOp of ops.positive) {
                const newUnequalCount = unequalCount + (transitiveOperators[otherOp].unequal ? 1 : 0);
                for (const other of this[otherOp]) {
                    if (other.stringValue === rightString) {
                        return newUnequalCount;
                    }
                    const recurseValue = other.getRightExpressionUnequalCount(op, rightString, newUnequalCount, traversed);
                    if (recurseValue !== null) {
                        return recurseValue;
                    }
                }
            }
            traversed.delete(this.stringValue);
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

    public getEquivalentValues(): Expression[] {
        const found = new Map([[this.stringValue, this.expression]])
        this.getEquivalentValuesInternal(found);
        return [...found.values()].slice(1);
    }

    private getEquivalentValuesInternal(alreadyFound: Map<string,Expression>) {
        for (let graph of this["=="]) {
            if (!alreadyFound.has(graph.stringValue)) {
                alreadyFound.set(graph.stringValue, graph.expression);
                graph.getEquivalentValuesInternal(alreadyFound);
            }
        }
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
            graphs.set(stringValue, graph = new ComparisonGraph(e));
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