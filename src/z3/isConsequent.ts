import { Bool } from "z3-solver";
import { Expression } from "../expressions";
import { Maybe } from "../isConsequent";
import { negate } from "../negate";
import { getZ3, toZ3 } from "./toZ3";

export async function isConsequent(a: Expression, b: Expression): Promise<Maybe> {
    const { context, z3 } = getZ3();
    const solver = new context.Solver();
    const z3A = toZ3(context, a) as Bool<"main">;

    solver.add(z3A);
    solver.add(toZ3(context, negate(b)) as Bool<"main">);
    const result = await solver.check();
    // console.log(`running z3 2: ${a} => ${b} = ${result}`);
    if (result === "unsat") {
        return true;
    }

    solver.reset();

    solver.add(z3A);
    solver.add(toZ3(context, b) as Bool<"main">);
    // console.log(`running z3 1: ${a} => ${b}`);
    if (await solver.check() === "unsat") {
        // cannot solve for a and b true at same time => false.
        return false;
    }

    return null;
}
