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
    @Input() private visualizers: Visualizer[];
    @ViewChild('animationCanvas') private animationCanvas: ElementRef;

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

        const density = 40;
        const minSize = 2;
        const maxSize = 30;
        const minV = 0.4;
        const maxV = 2;

        const colorArray = [
            '#FFFFFF',
        ];

        window.addEventListener('resize', setSize);

        function Circle(x, y, radius, dx, dy) {
            this.x = x;
            this.y = y;
            this.default_radius = radius;
            this.radius = radius;
            this.dx = dx;
            this.dy = dy;
            this.color = colorArray[Math.floor(Math.random() * colorArray.length)];

            this.draw = function () {
                c.beginPath();
                c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
                c.fillStyle = this.color;
                c.fill();
            };

            this.update = function() {
                if ((this.x + this.radius) > canvas.clientWidth || (this.x - this.radius) < 0) {
                    this.dx *= -1; // Invert
                }

                if ((this.y + this.radius) > canvas.clientHeight || (this.y - this.radius) < 0) {
                    this.dy *= -1; // Invert
                }

                this.x += this.dx;
                this.y += this.dy;

                // interactivity
                if (this.radius >= this.default_radius) {
                    this.radius -= 2;
                }

                this.draw();
            }
        }

        const circles = [];

        for (let i = 0; i < density; i++) {
            const radius = Math.random() * maxSize + minSize;
            const x = radius + Math.random() * (canvas.clientWidth - radius * 2);
            const y = radius + Math.random() * (canvas.clientHeight - radius * 2);
            const directionX = Math.random() < 0.5 ? -1 : 1;
            const directionY = Math.random() < 0.5 ? -1 : 1;
            const dx = Math.random() * maxV + minV * directionX;
            const dy = Math.random() * maxV + minV * directionY;

            circles[i] = new Circle(x, y, radius, dx, dy);
        }

        const animate = () => {
            this.lastAnimationId = requestAnimationFrame(animate);
            c.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
            for (let i = 0; i < circles.length; i++) {
                const circle = circles[i];
                circle.update();
            }
        };

        animate();
        /** @end-author Nico Klaassen */
    }
    /** @end-author Bart Wesselink */
}
