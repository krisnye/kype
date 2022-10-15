
export enum LogicalOperator {
    and = "&&",
    or = "||",
}

export enum MathOperator {
    addition = "+",
    subtraction = "-",
    multiplication = "*",
    division = "/",
    remainder = "%",
    exponentiation = "**",
}

export enum ComparisonOperator {
    equality = "==",
    inequality = "!=",
    lessThan = "<",
    lessThanOrEqual = "<=",
    greaterThan = ">",
    greaterThanOrEqual = ">=",
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

export function compareBinaryOperator(a: string, b: string) {
    return (operatorSortOrder[a] ?? 0) - (operatorSortOrder[b] ?? 0)
        || a.localeCompare(b);
}