import { InternalSymbolName } from "typescript";
import { DotExpression, type Expression, NumberLiteral, TypeExpression, BinaryExpression } from "./expressions";

//  expression constants
export const trueExpression = new NumberLiteral(1n);
export const falseExpression = new NumberLiteral(0n);
export const dotExpression = new DotExpression();
export const positiveInfinity = new NumberLiteral(Number.POSITIVE_INFINITY);
export const negativeInfinity = new NumberLiteral(Number.NEGATIVE_INFINITY);

export function isTrue(a: unknown) { return a instanceof NumberLiteral && a.value !== 0n; }
export function isFalse(a: unknown) { return a instanceof NumberLiteral && a.value === 0n; }

//  type constants
export const never = new TypeExpression(new BinaryExpression(dotExpression, "!=", dotExpression));
export const always = new TypeExpression(new BinaryExpression(dotExpression, "==", dotExpression));

export function isNever(a: unknown) {
    return a instanceof TypeExpression && isFalse(a.proposition);
}

export function isAlways(a: unknown) {
    return a instanceof TypeExpression && isTrue(a.proposition);
}