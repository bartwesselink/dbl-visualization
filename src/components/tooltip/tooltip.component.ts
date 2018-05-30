import {Component, Input} from '@angular/core';

/** @author Bart Wesselink */
@Component({
    selector: 'app-tooltip',
    templateUrl: './tooltip.component.html',
})
export class TooltipComponent {
    @Input() public label: string;
    @Input() public x: number;
    @Input() public y: number;
}
/** @end-author Bart Wesselink */