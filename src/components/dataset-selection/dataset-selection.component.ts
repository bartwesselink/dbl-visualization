import {Component, EventEmitter, Output} from '@angular/core';
import {DatasetStorageService} from "../../providers/dataset-storage-service";
import {DatasetFile} from '../../interfaces/dataset-file';
import {TreeInput} from '../../interfaces/tree-input';

@Component({
    selector: 'app-dataset-selection',
    templateUrl: './dataset-selection.component.html',
})
export class DatasetSelectionComponent {
    /** @author Mathijs Boezer */
    @Output() newContent = new EventEmitter<TreeInput>();
    public view: boolean = false;
    public currentFile: string;

    constructor(public datasetStorageService: DatasetStorageService) {}

    public loadDefaultDataset(dataset: DatasetFile) {
        let path = dataset.path;

        // read text file and emit the content
        let me = this;
        let raw = new XMLHttpRequest();
        raw.open("GET", path, false);
        raw.onreadystatechange = function () {
            if(raw.readyState === 4){
                if(raw.status === 200 || raw.status == 0){
                    me.newContent.emit({
                        content: raw.responseText,
                        name: dataset.title,
                    });
                }
            }
        };
        raw.send(null);

        this.close();
    }

    public loadUserDataset(dataset: DatasetFile) {
        let key = dataset.title;
        let content = this.datasetStorageService.getDataset(key);

        if(content) {
            this.newContent.emit({
                content,
                name: dataset.title,
            });
        }

        this.close();
    }

    public open(): void {
        this.view = true;
    }

    public close(): void {
        this.view = false;
    }

    public setCurrentFile(file: string) {
        this.currentFile = file;
    }
    /** @end-author Mathijs Boezer */
}
