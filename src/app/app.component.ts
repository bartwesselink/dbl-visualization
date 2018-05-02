import {Component, OnInit, ViewChild} from '@angular/core';
import {Tab} from '../models/tab';
import { Node } from '../models/node';
import {NewickParser} from '../utils/newick-parser';
import {SidebarComponent} from '../components/sidebar/sidebar.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
    tabs: Tab[] = [];
    tree: Node;
    @ViewChild(SidebarComponent) private sidebar: SidebarComponent;

    private parser = new NewickParser();

    ngOnInit(): void {
        this.addTab();
    }

    /** @author Jordy Verhoeven */
    parseTree(data: string) {
        const line = this.parser.extractLines(data);

        if (line !== null) {
            this.tree = this.parser.parseTree(line);

            setTimeout(() => {
                this.sidebar.reloadData();
            });
        }
    }
    /** @end-author Jordy Verhoeven */

    private addTab() {
        this.tabs.push({
            title: 'Temporary tab',
            active: true,
            id: 'temp-tab',
        });
    }
}
