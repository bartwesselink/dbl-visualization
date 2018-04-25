import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

@Component({
    selector: 'app-window',
    templateUrl: './window.component.html',
})
export class WindowComponent implements OnInit {
    @ViewChild('canvas') private canvas: ElementRef;
    private context: CanvasRenderingContext2D;

    ngOnInit() {
        this.context = this.canvas.nativeElement.getContext('2d');

        this.setHeight();

        window.onresize = () => this.setHeight();
    }

    private drawText(): void {
        this.context.font = "30px Verdana";

        const gradient = this.context.createLinearGradient(0, 0, this.canvas.nativeElement.width, 0);
        gradient.addColorStop(0, "magenta");
        gradient.addColorStop(0.5, "blue");
        gradient.addColorStop(1.0, "red");

        this.context.fillStyle = gradient;
        this.context.fillText("Hello world", 10, 90);
    }
    /** @author Bart Wesselink */
    private clear(): void {
        this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    }

    private redraw(): void {
        this.clear();
        this.drawText();
    }

    private setHeight(): void {
        // fix to set correct canvas size
        setTimeout(() => {
            this.canvas.nativeElement.width = this.canvas.nativeElement.scrollWidth;
            this.canvas.nativeElement.height = this.canvas.nativeElement.scrollHeight;

            this.redraw();
        });
    }
    /** @end-author Bart Wesselink */
}
