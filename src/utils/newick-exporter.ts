import {Node} from "../models/node";
import * as FileSaver from "file-saver";

/** @author Nico Klaassen */
export class NewickExporter {
    errorMsg = "Error generating Newick data from selected tree.";
    successMsg = "Newick data ready for download.";

    constructor(private snackbar: any) {
    }

    public exportTree(tree: Node): void {
        try {
            const newickString = this.parseTree(tree) + ";";
            const now = new Date();
            const month = now.getMonth() + 1 > 9 ? now.getMonth() + 1 : (0).toString() + (now.getMonth() + 1);
            const day = now.getDate() > 9 ? now.getDate() : (0).toString() + now.getDate();
            const hours = now.getHours() > 9 ? now.getHours() : (0).toString() + now.getHours();
            const minutes = now.getMinutes() > 9 ? now.getMinutes() : (0).toString() + now.getMinutes();
            const fileName = "export-" + now.getFullYear() + "-" +
                month + "-" +
                day + "_" +
                hours +
                minutes + ".ngl";

            const file = new File([newickString], fileName, {type: "text/plain"});
            this.feedback(this.successMsg);
            FileSaver.saveAs(file);
        } catch {
            this.feedback(this.errorMsg);
        }
    }


    private parseTree(tree: Node): string {
        let newickString = "";

        if (tree.children.length > 0) { // There is always an array, but it might be empty
            newickString = newickString + "(" ;
            for (let i = 0; i < tree.children.length; i++) {
                newickString = newickString + this.parseTree(tree.children[i]);
                if (i < tree.children.length) {
                    newickString = newickString + ",";
                }
            }
            newickString = newickString.substring(0, newickString.length - 1) + ")";
        }

        newickString += tree.label + ":" + tree.length;
        return newickString;
    }


    private feedback(message: String): void {
        this.snackbar.nativeElement.MaterialSnackbar.showSnackbar({message: message});
    }

    /** @end-author Nico Klaassen */
}
