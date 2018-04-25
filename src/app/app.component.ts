import {Component, OnInit} from '@angular/core';
import {Tab} from '../models/tab';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
    tabs: Tab[] = [];

    ngOnInit(): void {
        this.addTab();
    }

    private addTab() {
        this.tabs.push({
            title: 'Temporary tab',
            active: true,
            id: 'temp-tab',
        });
    }
}
