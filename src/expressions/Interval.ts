import { joinExpressions } from "../utility/joinExpressions";
import { BinaryExpression } from "./BinaryExpression";
import { DotExpression } from "./DotExpression";
import { Expression } from "./Expression";
import { Literal } from "./Literal";
import { TypeExpression } from "./TypeExpression";

export class Interval extends Expression {

    get sortOrder() { return -10; }
    min: number;
    max: number;
    minExclusive: boolean;
    maxExclusive: boolean;

    constructor(min: number, max: number, minExclusive = false, maxExclusive = false) {
        super();
        this.min = min;
        this.max = max;
        this.minExclusive = minExclusive && min !== Number.NEGATIVE_INFINITY;
        this.maxExclusive = maxExclusive && max !== Number.POSITIVE_INFINITY;
    }

    toStringInternal() {
        return `{${this.minExclusive ? `>` : ``}${this.min} .. ${this.maxExclusive ? `<` : ``}${this.max}}`;
    }

    toType(): TypeExpression {
        let expressions: Expression[] = [];
        if (this.min !== Number.NEGATIVE_INFINITY) {
            expressions.push(new BinaryExpression(new DotExpression(), this.minExclusive ? ">" : ">=", new Literal(this.min)));
        }
        if (this.max !== Number.POSITIVE_INFINITY) {
            expressions.push(new BinaryExpression(new DotExpression(), this.maxExclusive ? "<" : "<=", new Literal(this.max)));
        }
        if (expressions.length === 0) {
            expressions.push(new BinaryExpression(new DotExpression(), "<=", new Literal(Number.POSITIVE_INFINITY)));
        }
        return new TypeExpression(joinExpressions(expressions, "&&"));
    }

    static fromType(type: Expression): Interval[] {
        if (type instanceof TypeExpression) {
            type = type.proposition;
        }
        return type.split("||").map(option => {
            let min = new Literal(Number.NEGATIVE_INFINITY);
            let max = new Literal(Number.POSITIVE_INFINITY);
            let minExclusive = false;
            let maxExclusive = false;
            option.split("&&").forEach(term => {
                if (term instanceof BinaryExpression && term.left instanceof DotExpression && term.right instanceof Literal) {
                    if (term.operator.startsWith(">")) {
                        min = term.right;
                        minExclusive = !term.operator.endsWith("=");
                    }
                    if (term.operator.startsWith("<")) {
                        max = term.right;
                        maxExclusive = !term.operator.endsWith("=");
                    }
                }
            })
            return new Interval(min.value, max.value, minExclusive, maxExclusive);
        });
    }

}