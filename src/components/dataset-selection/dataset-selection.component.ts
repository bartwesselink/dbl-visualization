import {Component, EventEmitter, Output} from '@angular/core';
import {DatasetStorageService} from "../../providers/dataset-storage-service";
import {DatasetFile} from "../../interfaces/dataset-file";

@Component({
    selector: 'app-dataset-selection',
    templateUrl: './dataset-selection.component.html',
})
export class DatasetSelectionComponent {
    /** @author Mathijs Boezer */
    @Output() newContent = new EventEmitter<string>();

    constructor(public datasetStorageService: DatasetStorageService) {}

    public userUploadedDatasets: DatasetFile[] = [
        {title: 'test1', path: 'test1path'},
    ];

    private loadDefaultDataset(path: string) {
        let me = this;
        let raw = new XMLHttpRequest();
        raw.open("GET", path, false);
        raw.onreadystatechange = function () {
            if(raw.readyState === 4){
                if(raw.status === 200 || raw.status == 0){
                    me.newContent.emit(raw.responseText);
                }
            }
        };
        raw.send(null);
    }

    private loadUserDataset(key: string) {
        let content = this.datasetStorageService.getDataset(key);

        if(content !== null) {
            this.newContent.emit(content);
        }
    }
    /** @end-author Mathijs Boezer */
}
