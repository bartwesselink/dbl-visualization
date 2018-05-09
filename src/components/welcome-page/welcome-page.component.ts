import {Component, Input} from '@angular/core';
import {Visualizer} from '../../interfaces/visualizer';

@Component({
    selector: 'app-welcome-page',
    templateUrl: './welcome-page.component.html',
})
export class WelcomePageComponent {
    /** @author Bart Wesselink */
    @Input() private visualizers: Visualizer[];

    public getThumbnails(): string[] {
        return this.visualizers.filter((item: Visualizer) => item.getThumbnailImage() !== null)
            .map((item) => item.getThumbnailImage());
    }
    /** @end-author Bart Wesselink */
}
