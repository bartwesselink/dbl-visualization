import {Component, OnInit} from '@angular/core';
import {Tab} from '../models/tab';
import { Node } from '../models/node';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
    tabs: Tab[] = [];
    tree: Node;

    ngOnInit(): void {
        this.addTab();
    }

    parseTree(data: string) {

    }

    private addTab() {
        this.tabs.push({
            title: 'Temporary tab',
            active: true,
            id: 'temp-tab',
        });
    }
}
