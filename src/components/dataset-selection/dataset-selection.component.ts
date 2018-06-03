import {Component} from '@angular/core';

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
    public defaultDatasets: DatasetFile[] = [{title: 'NCBI Dataset', path: 'test1path'}, {title: 'Phylviz', path: 'test1path'}];
    public userUploadedDatasets: DatasetFile[] = [{title: 'test1', path: 'test1path'}];

    public loadDataset(path: string) {
        console.log(path);
    }
    /** @end-author Mathijs Boezer */
}
