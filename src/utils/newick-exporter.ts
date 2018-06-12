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
        const now = new Date();
        const month = now.getMonth() > 9 ? now.getMonth() : (0).toString() + now.getMonth();
        const day = now.getDate() > 9 ? now.getDate() : (0).toString() + now.getDate();
        const hours = now.getHours() > 9 ? now.getHours() : (0).toString() + now.getHours();
        const minutes = now.getMinutes() > 9 ? now.getMinutes() : (0).toString() + now.getMinutes();
        const fileName = "export_" + now.getFullYear() + "-" +
                                     month + "-" +
                                     day + "_" +
                                     hours +
                                     minutes + ".ngl";

        const file = new File([newickString], fileName, {type: "text/plain"});
        FileSaver.saveAs(file);
    }


    private parseTree(tree: Node): string {
        let newickString = "";
        newickString += tree.label; //+ ":" + tree.length;
 
        if (tree.children != null) {
            newickString = ")" + newickString;
            for (let i = 0; i < tree.children.length; i++) {
                newickString = this.parseTree(tree.children[i]) + newickString;
                if (i > 0) {
                    newickString = "," + newickString;
                }
            }
            newickString = "(" + newickString;
        }
        return newickString;
    }


    private feedback(message: String): void {
        this.snackbar.nativeElement.MaterialSnackbar.showSnackbar({message: message});
    }

    /** @end-author Jordy Verhoeven */
}
