import {Injectable, OnInit} from '@angular/core';
import {Settings} from '../interfaces/settings';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {DatasetFile} from "../interfaces/dataset-file";

@Injectable()
export class DatasetStorageService {
    /** @author Mathijs Boezer */
    private defaultDataPath = '/assets/default-data/';
    private userDatasetsStorageKey = 'userDatasets';

    public defaultDatasets: DatasetFile[] = [
        {title: 'NCBI Dataset', path: this.defaultDataPath + 'ncbi-taxonomy.tre'},
        {title: 'Phylviz', path: this.defaultDataPath + 'newick_example_phyloviz.nwk'},
    ];

    public userDatasets: DatasetFile[] = [];

    constructor() {
        if (localStorage.getItem('userDatasets') !== null) {
            try {
                this.userDatasets = JSON.parse(localStorage.getItem(this.userDatasetsStorageKey));
            } catch {
                console.error('Local storage register of datasets is corrupt');
            }
        }
    }

    public getDataset(key: string): string|null {
        return localStorage.getItem(key);
    }

    public saveDataset(title: string, dataset: string): void {
        try {
            localStorage.setItem(title, dataset);
            this.userDatasets.push( {title: title});
            localStorage.setItem(this.userDatasetsStorageKey, JSON.stringify(this.userDatasets));
        } catch {
            console.error('Could not save dataset to local storage, it\'s probably full.');
        }
    }

    /** @end-author Mathijs Boezer */
}
