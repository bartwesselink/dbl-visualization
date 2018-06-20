import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DatasetStorageService} from "../../providers/dataset-storage-service";
import {TreeInput} from '../../interfaces/tree-input';

@Component({
    selector: 'app-upload-tool',
    templateUrl: './upload-tool.component.html',
})
export class UploadToolComponent {
    /** @author Mathijs Boezer */
    @Output() newContent: EventEmitter<TreeInput> = new EventEmitter();
    @Input() type: 'menu'|'home' = 'menu';

    private fileTypeWhitelist = ['', 'text/plain',]; //Allowed types of files
    private errorMsg : string = "Wrong file type, please upload a Newick tree file.";

    constructor(private datasetStorageService: DatasetStorageService) {}

    public uploadFile(files: File[]) :void {
        var file: File = files[0];

        var fileReader: FileReader = new FileReader();
        var self = this; // Get reference to this
        // Create callback for the file reader
        fileReader.onload = function(e){
            var content: string = fileReader.result;
            self.newContent.emit({
                content,
                name: file.name,
            });
            self.datasetStorageService.saveDataset(file.name, content);
        };

        if(this.fileTypeWhitelist.includes(file.type))
            fileReader.readAsText(file); // Start reading
        else alert(this.errorMsg);
    }
    /** @end-author Mathijs Boezer */
}
