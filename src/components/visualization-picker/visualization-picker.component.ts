import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Visualizer} from '../../interfaces/visualizer';

@Component({
    selector: 'app-visualization-picker',
    templateUrl: './visualization-picker.component.html',
})
export class VisualizationPickerComponent {
    /** @author Bart Wesselink */
    @Input() visualizers: Visualizer[];
    @Output() select: EventEmitter<Visualizer> = new EventEmitter<Visualizer>();

    public selectItem(visualizer: Visualizer): void {
        this.select.emit(visualizer);

        // hide select box
        document.body.click();
    }

    /** @end-author Bart Wesselink */
}
