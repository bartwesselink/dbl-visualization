import {Directive, HostListener, Input, Renderer2} from '@angular/core';
import {TooltipComponent} from '../../components/tooltip/tooltip.component';

@Directive({
    selector: '[tooltip]',
})
export class TooltipDirective {
    /** @author Bart Wesselink */
    @Input() private tooltip: TooltipComponent;

    constructor(private renderer: Renderer2) {
    }

    @HostListener('mouseenter', ['$event'])
    enter($event: MouseEvent){
        this.tooltip.show();

        this.tooltip.setX($event.clientX);
        this.tooltip.setY($event.clientY);
    }

    @HostListener('mouseleave', ['$event'])
    leave($event: MouseEvent){
        this.tooltip.hide();
    }
    /** @end-author Bart Wesselink */
}