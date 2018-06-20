import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';

@Component({
    selector: 'app-view-cube',
    templateUrl: './view-cube.component.html',
})
export class ViewCubeComponent implements OnInit {
    @Input() private keyStrokeFunction: (event: KeyboardEvent) => any;
    @Input() private zoomFunction: (value: number) => any;

    @ViewChild('zoomSliderHolder') private zoomSliderHolder: ElementRef;
    public zoomSliderValue: number = 50;
    private zoomDragging: boolean = false;
    private intervalId: number; // id of the interval currently sending keys
    public readonly sliderPadding: number = 5;
    private readonly zoomMin = -2;
    private readonly zoomMax = 20;
    public dialogOpen: boolean = false;

    public ngOnInit(): void {
        window.addEventListener('mouseup', () => this.stopZoomDrag());
        window.addEventListener('mousemove', (event: MouseEvent) => this.zoomDrag(event));

        this.setZoomLevel(1);
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


        const zoomLevel = (this.zoomMax - (this.zoomMax - this.zoomMin) * (sliderPosition / holderHeight));
        const glLevel = Math.pow(2.0, zoomLevel);

        this.zoomFunction(glLevel);

        this.setZoomLevel(glLevel);
    }

    public stopZoomDrag(): void {
        this.zoomDragging = false;
    }

    public openHelp(): void {
        this.dialogOpen = true;
    }

    public close(): void {
        this.dialogOpen = false;
    }

    public rotateLeft(start: boolean): void {
        this.streamFakeKey('Q', start);
    }

    public rotateRight(start: boolean): void {
        this.streamFakeKey('E', start);
    }

    public reset(): void {
        this.sendFakeKey('T');
    }

    public moveUp(start: boolean): void {
        this.streamFakeKey('W', start);
    }

    public moveDown(start: boolean): void {
        this.streamFakeKey('S', start);
    }

    public moveRight(start: boolean): void {
        this.streamFakeKey('D', start);
    }

    public moveLeft(start: boolean): void {
        this.streamFakeKey('A', start);
    }

    public setZoomLevel(level: number): void {
        let log = Math.log2(level);

        if (log < this.zoomMin) {
            log = this.zoomMin;
        }

        if (log > this.zoomMax) {
            log = this.zoomMax;
        }

        let total = (Math.abs(this.zoomMin) + Math.abs(this.zoomMax));

        // we want to add this.zoomMin to both sides, so we equalize the fraction
        let fraction = (log + Math.abs(this.zoomMin)) / total;

        this.zoomSliderValue = (100 - (fraction * (100 - 2 * this.sliderPadding))) - this.sliderPadding;
    }

    private streamFakeKey(key: string, start: boolean): void {
        if (start) {
            let me = this;
            this.intervalId = setInterval(() => {
                me.sendFakeKey(key);
            }, 25);
        } else {
            clearInterval(this.intervalId);
        }
    }

    private sendFakeKey(key: string): void {
        const event: KeyboardEvent = { key: key } as any;

        this.keyStrokeFunction(event);
    }
}
