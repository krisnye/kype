
export enum LogicalOperator {
    and = "&&",
    or = "||",
    is = "is",
    isnt = "isnt",
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
