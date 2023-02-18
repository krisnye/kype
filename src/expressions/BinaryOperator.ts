
export const LogicalOperators = {
    "&&": true,
    "||": true,
} as const;
export type LogicalOperator = keyof typeof LogicalOperators;

export function isLogicalOperator(value: unknown): value is LogicalOperator {
    return LogicalOperators[value as LogicalOperator] === true;
}

export const MathOperators = {
    "+": true,
    "-": true,
    "*": true,
    "/": true,
    "%": true,
    "**": true
} as const;
export type MathOperator = keyof typeof MathOperators;

export function isMathOperator(value: unknown): value is MathOperator {
    return MathOperators[value as MathOperator] === true;
}

export const ComparisonOperators = {
    "==": true,
    "!=": true,
    "<": true,
    "<=": true,
    ">": true,
    ">=": true,
} as const;
export type ComparisonOperator = keyof typeof ComparisonOperators;

export function isComparisonOperator(value: unknown): value is ComparisonOperator {
    return ComparisonOperators[value as ComparisonOperator] === true;
}

export type BinaryOperator = LogicalOperator | MathOperator | ComparisonOperator;

const operatorSortOrder = Object.fromEntries([
    "&&",
    "||",
    "+",
    "-",
    "*",
    "/",
    "%",
    "**",
    "==",
    "!=",
    ">",
    ">=",
    "<",
    "<=",
].map((value, index) => [value, index]));

export function compareBinaryOperator(a: BinaryOperator, b: BinaryOperator) {
    return (operatorSortOrder[a] ?? 0) - (operatorSortOrder[b] ?? 0)
        || a.localeCompare(b);
}