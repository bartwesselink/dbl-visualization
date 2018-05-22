import { Node } from "../models/node";
import { Newick } from 'newick';

export class NewickParser {
    /** @author Jordy Verhoeven */

    errorMsg = "Invalid Newick file.";
    successMsg = "Succefully parsed Newick file.";

    constructor(private snackbar: any) {}

    public extractLines(data: string): string {
        const lines = data.split("\n");

        if (lines.length < 2) {
            this.feedback(this.errorMsg);
            return null;
        }
        data = null;
        return lines[1];
    }

    public parseTree(data: string): Node|null {
        let newick: any;
        try {
            newick = new Newick(data);
            this.feedback(this.successMsg);
        } catch {
            this.feedback(this.errorMsg);
            return;
        }
        const first = newick.tree;
        const parent = this.recurse(first);
        newick = null;
        return parent;
    }

    private recurse(node: any, parent: Node = null): any {
        const label = node.name;
        const children = node.branchset;

        const formatted: Node = {
            label: label,
            children: new Array(children == null ? 0 : children.length),
            subTreeSize: 1,
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

    private feedback(message: String): void{
        this.snackbar.nativeElement.MaterialSnackbar.showSnackbar({message: message});
    }
    /** @end-author Jordy Verhoeven */
}
