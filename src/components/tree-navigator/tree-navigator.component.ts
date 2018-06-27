import {Component, Input, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Node} from '../../models/node';
import {SelectBus} from '../../providers/select-bus';
import {TreeNavigatorItemComponent} from '../tree-navigator-item/tree-navigator-item.component';

@Component({
    selector: 'app-tree-navigator',
    templateUrl: './tree-navigator.component.html',
})
export class TreeNavigatorComponent implements OnInit {
    /** @author Bart Wesselink */
    @Input() tree: Node|Node[];
    @Input() parent: boolean = false;
    @ViewChildren(TreeNavigatorItemComponent) items: QueryList<TreeNavigatorItemComponent>;
    public current: Node[] = [];

    constructor(private selectBus: SelectBus) {
    }

    public static transformToNavigatorNode(node: Node): Node {
        return {
            label: node.label,
            children: [],
            expandable: node.children.length > 0,
            original: node,
            identifier: node.identifier,
            selected: node.selected === true,
            length: node.length,
            specifiedLength: node.specifiedLength,
        };
    }

    public ngOnInit() {
        this.reload();

        if (this.parent) {
            this.selectBus.nodeSelected.subscribe((node: Node) => {
                this.expandNode(node, this.tree as Node[]);

                this.items.forEach((item: TreeNavigatorItemComponent) => {
                    item.checkExpand();
                });
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

    private expandNode(needle: Node, haystack: Node[]): boolean {
        this.reload();
        
        for (const node of haystack) {
            if (node === needle) {
                node.forceExpand = false;
                return true;
            } else if (this.expandNode(needle, node.children)) {
                node.forceExpand = true;
                
                return true;
            } else {
                node.forceExpand = false;
            }
        }

        return false;
    }
    /** @end-author Bart Wesselink */
}
