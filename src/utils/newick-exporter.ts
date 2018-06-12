import {Node} from "../models/node";
import * as FileSaver from "file-saver";

/** @author Nico Klaassen */
export class NewickExporter {
    private readonly defaultNodeLength: number = 1.0;
    errorMsg = "Invalid Newick file.";
    successMsg = "Succefully parsed Newick file.";

    constructor(private snackbar: any) {
    }

    public exportTree(tree: Node): void {
        const newickString = this.parseTree(tree) + ";";
        const file = new File([newickString], "hello world.txt", {type: "text/plain;charset=utf-8"});
        FileSaver.saveAs(file);
    }


    private parseTree(tree: Node): string {
        let newickString = "";
        newickString += tree.label + ":" + tree.length;
        if (tree.children) {
            newickString = ")" + newickString;
        }
        for (let i = 0; i < tree.children.length; i++) {
            if (i > 0) {
                newickString = "," + newickString;
            }
            newickString = this.parseTree(tree.children[i]) + newickString;
        }
        if (tree.children) {
            newickString = "(" + newickString;
        }
        return newickString;
    }


    private feedback(message: String): void {
        this.snackbar.nativeElement.MaterialSnackbar.showSnackbar({message: message});
    }

    /** @end-author Jordy Verhoeven */
}
