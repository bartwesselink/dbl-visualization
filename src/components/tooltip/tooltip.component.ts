import {Component, ElementRef, Input, ViewChild} from '@angular/core';

/** @author Bart Wesselink */
@Component({
    selector: 'app-tooltip',
    templateUrl: './tooltip.component.html',
})
export class TooltipComponent {
    private readonly safeArea = 10;

    @Input() public label: string;
    @Input() public x: number;
    @Input() public y: number;
    @Input() public visible: boolean = true;

    @ViewChild('element') public element: ElementRef;

    show(): void {
        this.visible = true;
    }

    hide(): void {
        this.visible = false;
    }

    setX(x: number): void {
        this.x = x;

        setTimeout(() => {
            const width: number = this.element.nativeElement.clientWidth;
            const screenWidth: number = window.innerWidth;

            if (x + width > screenWidth - this.safeArea) {
                this.x = screenWidth - this.safeArea - width;
            }
        });
    }

    setY(y: number): void {
        this.y = y;

        setTimeout(() => {
            const height: number = this.element.nativeElement.clientHeight;
            const screenHeight: number = window.innerHeight;

            if (y + height > screenHeight - this.safeArea) {
                this.y = screenHeight - this.safeArea - height;
            }
        });
    }
}
/** @end-author Bart Wesselink */