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
    ]; // list of all example/default datasets that user can pick from with their paths

    public userDatasets: DatasetFile[] = [];

    constructor() {
        // get the list of user dataset keys from localstorage and populate the select box
        if (localStorage.getItem(this.userDatasetsStorageKey) !== null) {
            try {
                this.userDatasets = JSON.parse(localStorage.getItem(this.userDatasetsStorageKey));
            } catch {
                console.error('Local storage register of datasets is corrupt'); // in case json parsing fails
            }
        }
    }

    public getDataset(key: string): string|null {
        return localStorage.getItem(key);
    }

    public saveDataset(title: string, dataset: string): void {
        try {
            localStorage.setItem(title, dataset);
            this.userDatasets.push( {title: title}); // add to user dataset options
            localStorage.setItem(this.userDatasetsStorageKey, JSON.stringify(this.userDatasets)); // save extended list
        } catch {
            console.error('Could not save dataset to local storage, it\'s probably full.');
        }
    }

    /** @end-author Mathijs Boezer */
}
