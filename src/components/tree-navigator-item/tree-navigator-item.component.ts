import {Component, Input, ViewChild} from '@angular/core';
import {Node} from '../../models/node';
import {TreeNavigatorComponent} from '../tree-navigator/tree-navigator.component';

@Component({
    selector: 'app-tree-navigator-item',
    templateUrl: './tree-navigator-item.component.html',
})
export class TreeNavigatorItemComponent {
    /** @author Bart Wesselink */
    @Input() node: Node;
    @ViewChild(TreeNavigatorComponent) recursiveChildTree?: TreeNavigatorComponent;

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
    /** @end-author Bart Wesselink */
}
