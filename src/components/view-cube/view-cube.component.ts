import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';

declare var dialogPolyfill;

@Component({
    selector: 'app-view-cube',
    templateUrl: './view-cube.component.html',
})
export class ViewCubeComponent implements OnInit {
    @Input() private keyStrokeFunction: (event: KeyboardEvent) => any;
    @Input() private zoomFunction: (value: number) => any;
    @ViewChild('dialog') private dialog: ElementRef;

    @ViewChild('zoomSliderHolder') private zoomSliderHolder: ElementRef;
    public zoomSliderValue: number = 50;
    private zoomDragging: boolean = false;
    public readonly sliderPadding: number = 5;
    private readonly zoomMin = -2;
    private readonly zoomMax = 20;

    public ngOnInit(): void {
        dialogPolyfill.registerDialog(this.dialog.nativeElement);

        window.addEventListener('mouseup', () => this.stopZoomDrag());
        window.addEventListener('mousemove', (event: MouseEvent) => this.zoomDrag(event));
    }

    public startZoomDrag() {
        this.zoomDragging = true;
    }

    public zoomDrag(mouseEvent: MouseEvent) {
        if (!this.zoomDragging) {
            return;
        }

        const mouseY = mouseEvent.clientY;

        const holderTop = this.zoomSliderHolder.nativeElement.getBoundingClientRect().top;
        const holderHeight = this.zoomSliderHolder.nativeElement.clientHeight;

        let sliderPosition = mouseY - holderTop;

        if (sliderPosition < 0) {
            sliderPosition = 0;
        }

        if (sliderPosition > holderHeight) {
            sliderPosition = holderHeight;
        }


        const zoomLevel = (this.zoomMax - (this.zoomMax - this.zoomMin) * (sliderPosition / holderHeight)) + this.zoomMin;
        this.zoomFunction(Math.pow(2.0, zoomLevel));

        // the formula adds padding ands makes sure the cursor is always at least 5% from the top.
        this.zoomSliderValue = sliderPosition / holderHeight * 100 * (1 - (2 * this.sliderPadding) / 100) + this.sliderPadding;
    }

    public stopZoomDrag(): void {
        this.zoomDragging = false;
    }

    public openHelp(): void {
        this.dialog.nativeElement.showModal();

        // fix for button being selected
        setTimeout(() => this.dialog.nativeElement.focus());
    }

    public close(): void {
        this.dialog.nativeElement.close();
    }

    public rotateLeft(): void {
        this.sendFakeKey('Q');
    }

    public rotateRight(): void {
        this.sendFakeKey('E');
    }

    public reset(): void {
        this.sendFakeKey('T');
    }

    public moveUp(): void {
        this.sendFakeKey('W');
    }

    public moveDown(): void {
        this.sendFakeKey('S');
    }

    public moveRight(): void {
        this.sendFakeKey('D');
    }

    public moveLeft(): void {
        this.sendFakeKey('A');
    }

    private sendFakeKey(key: string): void {
        const event: KeyboardEvent = { key: key } as any;

        this.keyStrokeFunction(event);
    }
}