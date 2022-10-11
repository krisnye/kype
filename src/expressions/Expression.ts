
// export interface Visitor {
//     enter?(e: Expression): void;
//     leave?(e: Expression): Expression;
// }

import splitExpressions from "../utility/splitExpressions";

export abstract class Expression {

    // traverse(visitor: Visitor) {
    //     visitor.enter?.(this);
    //     return visitor.leave?.(this) ?? this;
    // }

    // traverseChildren(visitor: Visitor) {
    // }

    split(operator: string) {
        return [...splitExpressions(this, operator)];
    }

    abstract readonly sortOrder: number;

}
