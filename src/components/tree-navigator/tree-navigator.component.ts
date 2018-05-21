import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Node} from '../../models/node';
import {SelectBus} from '../../providers/select-bus';

@Component({
    selector: 'app-tree-navigator',
    templateUrl: './tree-navigator.component.html',
})
export class TreeNavigatorComponent implements OnInit {
    /** @author Bart Wesselink */
    @Input() tree: Node|Node[];
    @Input() parent: boolean = false;
    public current: Node[] = [];

    constructor(private selectBus: SelectBus) {
    }

    public hasNode(node: Node): boolean {
        let foundChild;

        if (this.tree === node) {
            foundChild = node;
        } else if (this.tree instanceof Array) {
            foundChild = this.tree.find((item: Node) => item === node);
        }

        return foundChild != null;
    }

    public static transformToNavigatorNode(node: Node): Node {
        return {
            label: node.label,
            children: [],
            expandable: node.children.length > 0,
            original: node,
            identifier: node.identifier,
            selected: node.selected === true,
        };
    }

    public ngOnInit() {
        this.reload();

        if (this.parent) {
            this.selectBus.nodeSelected.subscribe((node: Node) => {

            });
        }
    }

    public reload() {
        if (this.tree == null) {
            return;
        }

        // check if input is root node (not an array)
        if (!(this.tree instanceof Array)) {
            this.tree = [this.tree]; // transform to array
        }

        this.initialize();
    }

    public reset(): void {
        // contract all
        for (const node of this.current) {
            node.children = [];
        }

        this.initialize();
    }

    public update(nodes: Node[]) {
        this.tree = nodes;
        this.initialize();
    }

    private initialize(): void {
        this.current = [];

        // create a flat tree, such that Angular does not have to loop over the whole tree when it is not expanded
        for (const node of (this.tree as Node[])) {
            this.current.push(TreeNavigatorComponent.transformToNavigatorNode(node));
        }
    }
    /** @end-author Bart Wesselink */
}
