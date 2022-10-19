import { Token } from "../Token";

export interface LineProps {
    tokens: Token[];
    children: Line[];
}

export class Line {

    tokens!: Token[];
    children!: Line[];

    constructor(tokens: Token[], children: Line[]) {
        this.tokens = tokens;
        this.children = children;
    }

}
