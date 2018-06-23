import {Component, Input} from '@angular/core';
import {Node} from '../../models/node';
import {SelectBus} from '../../providers/select-bus';
import {FormBuilder, FormControl} from '@angular/forms';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
})
export class SearchComponent {
    /** @author Bart Wesselink */
    @Input() private tree: Node;

    public results: Node[] = [];
    public searching: boolean = false;
    public searchControl: FormControl;

    constructor(private fb: FormBuilder, private selectBus: SelectBus) {
        this.createControl();
    }

    public select(node: Node) {
        this.selectBus.selectNode(node);
        this.searchControl.reset();

        this.close();
    }

    public close(): void {
        this.searching = false;
    }

    private createControl(): void {
        this.searchControl = this.fb.control('');
        this.searchControl.valueChanges.subscribe((value: string) => {
            if (value != null && value.length > 0) {
                this.searching = true;
                this.results = [];

                this.search(this.tree, value);
            } else {
                this.searching = false;
            }
        });
    }

    private search(node: Node, value: string) {
        const label = node.label;

        if (label != null && label.indexOf(value) !== -1) {
            this.results.push(node);
        }

        for (const child of node.children) {
            this.search(child, value);
        }
    }

    /** @end-author Bart Wesselink */
}
