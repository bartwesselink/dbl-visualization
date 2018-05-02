import { Node } from "../models/node";

/**
 * New typescript file
 */
export class NewickParser {

    public parseTree(data: string, parent: Node = null): Node{
        if (data.length === 0) {
            return;
        }

        const firstP = data.lastIndexOf(')');
        let last = data.slice(firstP+1, data.length);
        if(last.charAt(last.length - 1) == ';'){
            last=last.slice(0,last.length-1);
        }

        const node: Node = {
            label: last,
            parent: parent,
            children: [],
        };


        console.log(last);
    }

}