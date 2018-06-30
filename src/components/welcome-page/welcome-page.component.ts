import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Visualizer} from '../../interfaces/visualizer';

@Component({
    selector: 'app-welcome-page',
    templateUrl: './welcome-page.component.html',
})
export class WelcomePageComponent implements OnInit {
    /** @author Bart Wesselink */
    @Output() private newContent: EventEmitter<string> = new EventEmitter<string>();
    @Output() private goToApp: EventEmitter<void> = new EventEmitter<void>();
    @Output() private goToDatasets: EventEmitter<void> = new EventEmitter<void>();
    @Output() private goToHelp: EventEmitter<void> = new EventEmitter<void>();
    @Input() private visualizers: Visualizer[];
    @Input() private runAnimation: boolean;
    @ViewChild('animationCanvas') private animationCanvas: ElementRef;

    private animationIsRunning: boolean = true;

    public fullScreenAnimation: boolean = true;
    @Input() set showApp(showApp: boolean) {
        this.fullScreenAnimation = showApp;

        setTimeout(() => this.animate());
    }

    private lastAnimationId: number;

    public getThumbnails(): string[] {
        return this.visualizers.filter((item: Visualizer) => item.getThumbnailImage() !== null)
            .map((item) => item.getThumbnailImage());
    }

    public ngOnInit(): void {
        this.animate();
    }

    public outputContent(content: string) {
        this.newContent.emit(content);
    }

    public navigateToApp(): void {
        this.goToApp.emit();
    }

    public navigateToDatasets(): void {
        this.goToDatasets.emit();
    }

    public navigateToHelp(): void {
        this.goToHelp.emit();
    }

    public animate(): void {
        /** @author Nico Klaassen */
        const canvas = this.animationCanvas.nativeElement;

        // check if we have to cancel a previous animation
        if (this.lastAnimationId != null) {
            cancelAnimationFrame(this.lastAnimationId);
        }

        const setSize = () => {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        };

        setTimeout(setSize, 100);

        const c = canvas.getContext('2d');

        const density = 100;// Number of circles
        const minSize = 2;  // Minimum radius
        const maxSize = 40; // Maximum radius
        const minV = 0.08;  // Minimum speed
        const maxV = 0.6;   // Maximum speed

        window.addEventListener('resize', setSize);

        // Circle object to track positions
        function Circle(x, y, radius, dx, dy) {
            this.x = x;
            this.y = y;
            this.radius = radius;
            this.dx = dx;
            this.dy = dy;
            this.color = 255;
            this.alpha = Math.max(1 - Math.min(radius / (maxSize + minSize), 1.0), 0.2);

            // Method to draw the shape
            this.draw = function () {
                c.beginPath();
                c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
                c.filter = 'blur(' + Math.max(this.radius / (minSize + maxSize) * 10 - 3, 0)  + 'px) brightness(1.2)';
                c.fillStyle = "rgba(" + this.color + ", " + this.color + ", " + this.color + ", " + this.alpha + ")";
                c.fill();
            };

            // Method which calculates the next 'step' in the animation
            this.update = function() {
                // Boundary collision detection
                if ((this.x + this.radius) > canvas.clientWidth || (this.x - this.radius) < 0) {
                    this.dx *= -1; // Invert
                }
                if ((this.y + this.radius) > canvas.clientHeight || (this.y - this.radius) < 0) {
                    this.dy *= -1; // Invert
                }

                // Updating positions according to x and y velocities
                this.x += this.dx;
                this.y += this.dy;

                this.draw();
            }
        }

        const circles = [];

        // Initializing all the circles
        for (let i = 0; i < density; i++) {
            // Random shape parameters
            const radius = Math.random() * maxSize + minSize;
            const x = radius + Math.random() * (canvas.clientWidth - radius * 2);
            const y = radius + Math.random() * (canvas.clientHeight - radius * 2);

            // Random up/down and left/right
            const directionX = Math.random() > 0.5 ? -1 : 1;
            const directionY = Math.random() > 0.5 ? -1 : 1;

            // Random velocities
            const dx = Math.max(Math.random() * maxV, minV) * directionX;
            const dy = Math.max(Math.random() * maxV, minV) * directionY;

            circles[i] = new Circle(x, y, radius, dx, dy);
        }

        const animate = () => {
            this.lastAnimationId = requestAnimationFrame(animate);
            if (this.runAnimation) {
                c.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight); // Clear canvas

                // Update all the shapes for the next 'animation frame' / step
                for (let i = 0; i < circles.length; i++) {
                    const circle = circles[i];
                    circle.update();
                }
            } else {
                this.animationIsRunning = false;
            }
        };

        animate();
        /** @end-author Nico Klaassen */
    }
    /** @end-author Bart Wesselink */
}
