import { Node } from "../models/node";
import { Newick } from 'newick'

export class NewickParser {
    /** @author Jordy Verhoeven */
    private readonly defaultNodeLength: number = 1.0;

    public extractLines(data: string): string {
        const lines = data.split("\n");

        if (lines.length < 2) {
            console.error('Invalid file supplied.');

            return null;
        }

        data = null;

        return lines[1];
    }

    public parseTree(data: string): Node {
        let newick = new Newick(data);

        const first = newick.tree;

        const parent = this.recurse(first);

        newick = null;

        return parent;
    }

    private recurse(node: any, parent: Node = null): any {
        const label = node.name;
        const children = node.branchset;
        const length = node.length? node.length : this.defaultNodeLength;

        const formatted: Node = {
            label: label,
            children: new Array(children == null ? 0 : children.length),
            subTreeSize: 1,
            length: length,
            parent,
        };

        if (children != null) {
            let i = 0;

            for (const child of children) {
                const formattedChildNode = this.recurse(child, formatted);
                formatted.children[i] = formattedChildNode;

                formatted.subTreeSize += formattedChildNode.subTreeSize;

                i++;
            }
        }

        return formatted;
    }
    /** @end-author Jordy Verhoeven */
}
