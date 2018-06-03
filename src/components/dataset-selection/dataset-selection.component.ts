import {Component, EventEmitter, Output} from '@angular/core';

interface DatasetFile {
    title: string;
    path: string;
}



@Component({
    selector: 'app-dataset-selection',
    templateUrl: './dataset-selection.component.html',
})
export class DatasetSelectionComponent {
    /** @author Mathijs Boezer */
    @Output() newContent = new EventEmitter<string>();

    private defaultDataPath = '/assets/default-data/';
    public defaultDatasets: DatasetFile[] = [
        {title: 'NCBI Dataset', path: this.defaultDataPath + 'ncbi-taxonomy.tre'},
        {title: 'Phylviz', path: this.defaultDataPath + 'newick_example_phyloviz.nwk'},
    ];

    public userUploadedDatasets: DatasetFile[] = [
        {title: 'test1', path: 'test1path'},
    ];

    private loadDataset(path: string) {
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
    /** @end-author Mathijs Boezer */
}
