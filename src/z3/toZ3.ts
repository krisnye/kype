import { BinaryExpression, ComparisonOperator, Expression, ExpressionKind, LogicalOperator, NumberLiteral, Reference, StringLiteral, UnaryExpression, UnaryOperator } from "../expressions";
import { MathOperator } from "../expressions";
import * as z3 from "z3-solver";
import { Z3_ast } from "z3-solver";

let context: z3.Context<"main">;
let z3Low: z3.Z3LowLevel["Z3"];
export async function initZ3Context() {
    const { Context, Z3 } = await z3.init();
    z3Low = Z3;
    context = Context('main');
    return context;
}

export function getZ3(): { context: z3.Context<"main">, z3: z3.Z3LowLevel["Z3"] } {
    if (!context) {
        throw new Error(`Z3 Context is not initialized.`);
    }
    return { context, z3: z3Low };
}

const stringToInt = new Map<string,number>();
function toInt(s: string): number {
    let value = stringToInt.get(s);
    if (value === undefined) {
        stringToInt.set(s, value = stringToInt.size);
    }
    return value;
}

const kindToZ3Type = [
    "Int",
    "Bool",
    "Int",
    "Real",
    "Int"
] as const;

type KeysOfValueType<T,V> = ({ [P in keyof T]: T[P] extends V ? P : never })[keyof T];
type BinaryOpKeys<T extends z3.Expr> = KeysOfValueType<T,(left: T) => z3.Expr>;

const mathOpToZ3Func: { [K in MathOperator | ComparisonOperator]: BinaryOpKeys<z3.Arith>} = {
    "+": "add",
    "-": "sub",
    "*": "mul",
    "%": "mod",
    "/": "div",
    "**": "pow",
    "!=": "neq",
    "==": "eq",
    "<=": "le",
    ">=": "ge",
    "<": "lt",
    ">": "gt",
};
const boolOpToZ3Func: { [K in LogicalOperator]: BinaryOpKeys<z3.Bool>} = {
    "&&": "and",
    "||": "or",
};

export function toZ3(c: z3.Context<"main">, a: Expression): z3.Expr<"main", z3.AnySort<"main">, Z3_ast> {
    if (a instanceof NumberLiteral) {
        return c.Int.val(a.value);
    }
    if (a instanceof StringLiteral) {
        return c.Int.val(toInt(a.value));
    }
    if (a instanceof UnaryExpression) {
        const arg = toZ3(c, a.argument);
        switch (a.operator) {
            case "!":
                if (c.isBool(arg)) {
                    return arg.not();
                }
                break;
            case "-":
                if (c.isArith(arg)) {
                    return arg.neg();
                }
                break;
        }
        throw `not supported: ${a}`;
    }
    if (a instanceof BinaryExpression) {
        const mathFunc = mathOpToZ3Func[a.operator as MathOperator];
        if (mathFunc) {
            const left = toZ3(c, a.left) as z3.Arith;
            const right = toZ3(c, a.right) as z3.Arith;
            return left[mathFunc](right);
        }
        const boolFunc = boolOpToZ3Func[a.operator as LogicalOperator];
        if (boolFunc) {
            const left = toZ3(c, a.left) as z3.Bool;
            const right = toZ3(c, a.right) as z3.Bool;
            return left[boolFunc](right);
        }
        throw new Error(`Operator not supported: ${a.operator}`);
    }
    //  all other expressions will just be treated as references.
    return c[kindToZ3Type[a.kind]].const(a.toString());
}
