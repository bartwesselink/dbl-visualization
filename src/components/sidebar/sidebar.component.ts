import {Component, Input, ViewChild} from '@angular/core';
import {Node} from '../../models/node';
import {TreeNavigatorComponent} from '../tree-navigator/tree-navigator.component';
import { NewickParser } from '../../utils/newick-parser';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
    /** @author Bart Wesselink */
    @ViewChild('navigator') navigator: TreeNavigatorComponent;
    @Input() tree: Node;

    contractAll(): void {
        this.navigator.reset();
    }
    /** @end-author Bart Wesselink */

    constructor() {
    }

    public reloadData() {
        this.navigator.reload();
    }
}
