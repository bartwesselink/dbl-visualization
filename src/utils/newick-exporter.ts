import {Node} from "../models/node";
import * as FileSaver from "file-saver";

/** @author Nico Klaassen */
export class NewickExporter {
    private readonly defaultNodeLength: number = 1.0;
    errorMsg = "Invalid Newick file.";
    successMsg = "Succefully parsed Newick file.";

    constructor(private snackbar: any) {
    }

    public exportTree(tree: Node): string {
        const file = new File(["Hello world!"], "hello world.txt", {type: "text/plain;charset=utf-8"});
        FileSaver.saveAs(file);
        return "Hello World";
    }


    private parseTree(data: string): Node | null {
       return null;
    }


    private feedback(message: String): void {
        this.snackbar.nativeElement.MaterialSnackbar.showSnackbar({message: message});
    }

    /** @end-author Jordy Verhoeven */
}
