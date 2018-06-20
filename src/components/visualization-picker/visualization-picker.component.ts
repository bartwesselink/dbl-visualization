import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Visualizer} from '../../interfaces/visualizer';

@Component({
    selector: 'app-visualization-picker',
    templateUrl: './visualization-picker.component.html',
})
export class VisualizationPickerComponent {
    /** @author Bart Wesselink */
    @Input() identifier: string = 'select';
    @Input() type: 'menu'|'tab' = 'menu';
    @Input() visualizers: Visualizer[];
    @Output() select: EventEmitter<Visualizer> = new EventEmitter<Visualizer>();
    public opened: boolean = false;

    public selectItem(visualizer: Visualizer): void {
        this.select.emit(visualizer);

        this.close();
    }

    public open(): void {
        this.opened = true;
    }

    public close(): void {
        this.opened = false;
    }

    /** @end-author Bart Wesselink */
}
