import { strict as assert } from "assert";
import { BinaryExpression } from "../expressions/BinaryExpression";
import { LogicalOperator } from "../expressions/BinaryOperator";
import { CallExpresssion } from "../expressions/CallExpression";
import { Expression } from "../expressions/Expression";
import { Literal } from "../expressions/Literal";
import { Reference } from "../expressions/Reference";
import { negate } from "../utility/negate";
import { joinExpressions } from "./joinExpressions";

type E = string | number | Expression;

export function e(expr: string): Reference
export function e(expr: number): Literal
export function e(expr: E): Expression
export function e(expr: E) {
    if (!(expr instanceof Expression)) {
        expr = typeof expr === 'string' ? new Reference(expr) : new Literal(expr);
    }
    return expr;
}
export function b(left: E, operator: string, right: E) {
    left = e(left);
    right = e(right);
    return new BinaryExpression(left, operator, right);
}
export function c(callee: any, ...args: Array<E>) {
    return new CallExpresssion(e(callee), args.map(e));
}
export function not(a: any) {
    return negate(e(a));
}
export function and(...expressions: E[]): Expression {
    return joinExpressions(expressions.map(e), LogicalOperator.and)!;
}
export function or(...expressions: E[]): Expression {
    return joinExpressions(expressions.map(e), LogicalOperator.or)!;
}
