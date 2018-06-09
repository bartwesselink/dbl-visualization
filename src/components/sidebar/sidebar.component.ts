import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Node} from '../../models/node';
import {TreeNavigatorComponent} from '../tree-navigator/tree-navigator.component';
import {SelectBus} from '../../providers/select-bus';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
    /** @author Bart Wesselink */
    private readonly SCROLL_X_NORMALISATION = 80;
    private readonly SCROLL_Y_NORMALISATION = 10;

    @ViewChild('navigator') navigator: TreeNavigatorComponent;
    @ViewChild('content') contentHolder: ElementRef;
    @Input() tree: Node;
    @Output() reset: EventEmitter<any> = new EventEmitter();

    contractAll(): void {
        this.navigator.reset();
    }
    /** @end-author Bart Wesselink */

    constructor(private selectBus: SelectBus) {
        this.selectBus.nodeSelected.subscribe((node: Node) => {
            // wait till everything is expanded, and then scroll the holder to the position
            setTimeout(() => {
                // because of the recursiveness, we have to use plain Javascript to fetch the node's position
                const nodeTreeNavigatorItem: HTMLElement = document.getElementById('node-' + node.identifier);

                if (nodeTreeNavigatorItem != null) {
                    let offsetTop = nodeTreeNavigatorItem.offsetTop - this.SCROLL_X_NORMALISATION;
                    let offsetLeft = nodeTreeNavigatorItem.offsetLeft - this.SCROLL_Y_NORMALISATION;

                    this.contentHolder.nativeElement.scrollTo(offsetLeft, offsetTop);
                }
            }, 300);
        });
    }

    public reloadData() {
        this.navigator.reload();
    }

    public resetTree() {
        this.reset.emit();
    }
}
