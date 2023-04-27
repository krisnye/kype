import { BinaryExpression, Expression } from "./expressions";
import { Maybe } from "./isConsequent";
import { memoize } from "./utility";

const transitiveOperators = {
    "==": { "==": true, ">=": null, "<=": null, "<": false, ">": false },
    "<": { "==": false, ">=": false, "<=": null, "<": true, ">": false },
    ">": { "==": false, ">=": null, "<=": false, "<": false, ">": true },
    "<=": { "==": true, ">=": null, "<=": true, "<": true, ">": false },
    ">=": { "==": true, ">=": true, "<=": null, "<": false, ">": true },
} as const;

const transitiveOperatorsReverse = {
    "==": "==",
    "<": ">",
    ">": "<",
    "<=": ">=",
    ">=": "<=",
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

    private hasRightExpression(op: TransitiveOperator, rightString: string, negate = false, set = new Set<string>()): boolean {
        const ops = transitiveOperators[op];
        for (const [otherOp, otherConsequent] of Object.entries(ops)) {
            if (otherConsequent === !negate) {
                for (const other of this[otherOp as TransitiveOperator]) {
                    if (other.stringValue === rightString) {
                        return true;
                    }
                    if (!set.has(other.stringValue)) {
                        set.add(other.stringValue);
                        // recurse, but only the first time we find this value.
                        const recurseOp = transitiveOperatorsRecurse[op];
                        const recurseValue = other.hasRightExpression(recurseOp, rightString, negate, set);
                        if (recurseValue !== null) {
                            return recurseValue;
                        }
                    }
                }
            }
        }
        return false;
    }

    isConsequent(op: TransitiveOperator, right: Expression): Maybe {
        const rightString = right.toString();
        if (this.hasRightExpression(op, rightString, false)) {
            return true;
        }
        if (this.hasRightExpression(op, rightString, true)) {
            return false;
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
            bGraph[transitiveOperatorsReverse[e.operator]].add(aGraph);
        }
    }
    return graphs;
});