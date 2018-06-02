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
    private readonly zoomMin = 0.1;
    private readonly zoomMax = 8;
    private readonly zoomCenter = 1;

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

        // the formula adds padding ands makes sure the cursor is always at least 5% from the top.
        // it also calculates how far from the center it should be, because it does not have to be the middle zoom level

        const halfHeight = holderHeight / 2;

        let zoomLevel, startPercentage, maxPercentage, position;

        if (sliderPosition >= halfHeight) {
            const correctedPosition = sliderPosition - halfHeight;

            zoomLevel = (1 - correctedPosition / halfHeight) * (this.zoomCenter - this.zoomMin) + this.zoomMin;

            this.zoomFunction(zoomLevel);

            startPercentage = 50;
            maxPercentage = 50 - this.sliderPadding;
            position = startPercentage + correctedPosition / halfHeight * maxPercentage;

            this.zoomSliderValue = position;
        } else {
            zoomLevel = (1 - sliderPosition / halfHeight) * (this.zoomMax - this.zoomCenter) + this.zoomCenter;

            this.zoomFunction(zoomLevel);

            startPercentage = this.sliderPadding;
            maxPercentage = 50 - this.sliderPadding;
            position = startPercentage + sliderPosition / halfHeight * maxPercentage;

            this.zoomSliderValue = position;
        }
    }

    public setZoomLevel(level: number): void {
        level = Math.max(this.zoomMin, level);
        level = Math.min(this.zoomMax, level);

        let startPercentage, maxPercentage;

        if (level <= this.zoomCenter) {
            startPercentage = 50;
            maxPercentage = 50 - this.sliderPadding;

            this.zoomSliderValue = (1 - (level - this.zoomMin) / (this.zoomCenter - this.zoomMin)) * maxPercentage + startPercentage;
        } else {
            startPercentage = this.sliderPadding;
            maxPercentage = 50 - this.sliderPadding;

            this.zoomSliderValue = (1 - (level - this.zoomCenter) / (this.zoomMax - this.zoomCenter)) * maxPercentage + startPercentage;
        }
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