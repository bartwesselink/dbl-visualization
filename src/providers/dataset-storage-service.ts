import {Injectable, OnInit} from '@angular/core';
import {Settings} from '../interfaces/settings';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {DatasetFile} from "../interfaces/dataset-file";
import {WebWorkerService} from 'angular2-web-worker';
import * as pako from 'pako';
import {Draw} from "../interfaces/draw";

declare var importScripts;

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

    constructor(private webWorkerService: WebWorkerService) {
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
        return pako.inflate(localStorage.getItem(key), {to: 'string'});
    }

    public saveDataset(title: string, dataset: string): void {
        try {
            if(!this.isDuplicate(title) || true) { // TODO remove '|| true' after testing is done
                this.userDatasets.push( {title: title}); // add to user dataset options
                localStorage.setItem(this.userDatasetsStorageKey, JSON.stringify(this.userDatasets)); // save extended list
                // compression
                this.webWorkerService.run((dataset) => {
                    importScripts('https://cdnjs.cloudflare.com/ajax/libs/pako/1.0.6/pako.min.js'); //TODO make this local
                    return pako.deflate(dataset, {to: 'string'});
                }, dataset)
                    .then((compressed: string) => {
                        localStorage.setItem(title, compressed);
                    })
                    .catch((error) => console.log(error));
            }
        } catch {
           console.error('Could not save dataset to local storage, it\'s probably full.');
        }
    }

    private isDuplicate(title: string) {
        for (let dataset of this.userDatasets) {
            if (dataset.title === title) return true;
        }
        return false;
    }

    /** @end-author Mathijs Boezer */
}
