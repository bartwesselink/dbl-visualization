import { Node } from "../models/node";
import { Newick } from 'newick';

export class NewickParser {
    /** @author Jordy Verhoeven */
    private readonly defaultNodeLength: number = 1.0;
    errorMsg = "Invalid Newick file.";
    successMsg = "Succefully parsed Newick file.";

    constructor(private snackbar: any) {}

    public extractLines(data: string): string|null {
        if(!(data.substring(0, 7).toLowerCase() == 'newick;')) {
            if(data.trim().slice(-1) == ';') { // Trim whitespaces and line feed at end
                data = 'newick;\n' + data;
            } else {
                this.feedback(this.errorMsg);
                return null;
            }
        }
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

    private recurse(node: any, parent: Node = null, identifier: { id: number } = { id: 0 }): any { // identifier is a object to ensure reference-passing
        const label = node.name;
        const children = node.branchset;
        const length = node.length ? node.length : this.defaultNodeLength;

        const formatted: Node = {
            label: label,
            children: new Array(children == null ? 0 : children.length),
            subTreeSize: 1,
            identifier: identifier.id,
            length: length,
            parent,
        };

        identifier.id++;

        if (children != null) {
            let i = 0;

            for (const child of children) {
                const formattedChildNode = this.recurse(child, formatted, identifier);
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
