import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Node} from '../../models/node';
import {TreeNavigatorComponent} from '../tree-navigator/tree-navigator.component';
import {SelectBus} from '../../providers/select-bus';

@Component({
    selector: 'app-tree-navigator-item',
    templateUrl: './tree-navigator-item.component.html',
})
export class TreeNavigatorItemComponent implements OnInit {
    /** @author Bart Wesselink */
    @Input() node: Node;
    @ViewChild('component') recursiveChildTree?: TreeNavigatorComponent;

    constructor(private selectBus: SelectBus) {
    }

    ngOnInit(): void {
        this.checkExpand();
    }

    public checkExpand(): void {
        if (this.node.original.forceExpand === true) {
            this.toggle();
        }
    }

    public toggle(): void {
        // expand node

        if (this.node.children.length > 0) { // then it is already expanded
            this.node.children = []; // reset children
        } else {
            // load more items
            for (const node of this.node.original.children) {
                this.node.children.push(node);
            }
        }

        this.updateChild();
    }

    public updateChild(): void {
        if (this.recursiveChildTree) {
            this.recursiveChildTree.update(this.node.children); // make sure child is updated
        }
    }

    public select(): void {
        this.selectBus.selectNode(this.node.original);
    }
    /** @end-author Bart Wesselink */
}
