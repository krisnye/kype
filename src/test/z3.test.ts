import * as z3 from "z3-solver";
import { strict as assert } from "assert";

export async function test() {
    const { Context, Z3 } = await z3.init();
    const context = Context('main');
    const { Solver, Int, Real, And, Or, Not } = context;
    {
        const x = Int.const('x');
        const solver = new Solver();
        const constraint = And(x.ge(0), x.lt(9));
        solver.add(constraint);
        assert.equal("sat", await solver.check());
    }
    {
        const x = Int.const('x');
        const solver = new Solver();
        solver.add(And(x.ge(0), x.lt(9)));
        assert.equal("sat", await solver.check());
    }
    {
        const x = Int.const('x');
        const solver = new Solver();
        solver.add(And(x.ge(0), x.lt(-1)));
        assert.equal("unsat", await solver.check());
    }
    {
        const x = Int.const('x');
        const solver = new Solver();
        solver.add(And(x.eq(0), x.neq(0)));
        assert.equal("unsat", await solver.check());
    }
    {
        const x = Real.const('x');
        const solver = new Solver();
        solver.add(And(x.eq(0), x.neq(0)));
        assert.equal("unsat", await solver.check());
    }

    //  OK, so the simplification is not so useful.
    //  The solving probably is useful.

    // // let's try to simplify?
    // const x = Int.const('x');
    // const expr = And(x.ge(0), x.ge(5));
    // Z3.ast_to_string(context.ptr, expr.ptr);
    // const result = await Z3.simplify(context.ptr, expr.ptr);
    // const s = Z3.ast_to_string(context.ptr, result);
    // // Z3.model_to_string(context.ptr, result);
    // console.log({ result, s });
}
