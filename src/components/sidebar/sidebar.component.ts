import {Component, ViewChild} from '@angular/core';
import {Node} from '../../models/node';
import {TreeNavigatorComponent} from '../tree-navigator/tree-navigator.component';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
    /** @author Bart Wesselink */
    @ViewChild('navigator') navigator: TreeNavigatorComponent;

    contractAll(): void {
        this.navigator.reset();
    }
    /** @end-author Bart Wesselink */

    // TODO: remove sample and add real data
    sample: Node;

    constructor() {
        this.createSample();
    }

    private createSample() {
        const top = {
            label: 'test',
            children: [],
        };

        const level1_1 = {
            label: 'test_1_1',
            children: [],
            parent: top,
        };

        const level1_2 = {
            label: 'test_1_2',
            children: [],
            parent: top,
        };

        const level1_3 = {
            label: 'test_1_3',
            children: [],
            parent: top,
        };

        top.children.push(level1_1);
        top.children.push(level1_2);
        top.children.push(level1_3);

        const level2_1 = {
            label: 'test_1_1_1',
            children: [],
            parent: level1_1,
        };

        const level2_2 = {
            label: 'test_1_2_1',
            children: [],
            parent: level1_2,
        };

        const level2_3 = {
            label: 'test_1_3_1',
            children: [],
            parent: level1_3,
        };

        level1_1.children.push(level2_1);
        level1_2.children.push(level2_2);
        level1_3.children.push(level2_3);

        this.sample = top;
    }
}
