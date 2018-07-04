import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Visualizer} from '../../interfaces/visualizer';
import {OpenGL} from "../../opengl/opengl";
import {ShaderMode} from "../../opengl/shaders/shaderMode";

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
    @ViewChild('openGlCheckCanvas') private openGlCheckCanvas: ElementRef;

    private initial: boolean = true

    private animationIsRunning: boolean = true;
    private hasGpu: boolean = false;

    public fullScreenAnimation: boolean = true;
    @Input() set showApp(showApp: boolean) {
        this.fullScreenAnimation = showApp;

        setTimeout(() => this.animate(), this.initial ? 300 : 0);
        this.initial = false;
    }

    private lastAnimationId: number;
    private gl: OpenGL;
    private glContext: WebGLRenderingContext;
    private errored: boolean = false;
    private lastError: string;

    public getThumbnails(): string[] {
        return this.visualizers.filter((item: Visualizer) => item.getThumbnailImage() !== null)
            .map((item) => item.getThumbnailImage());
    }

    public ngOnInit(): void {
        this.glContext = this.animationCanvas.nativeElement.getContext('webgl2', {
            preserveDrawingBuffer: false,
            depth: true,
            alpha: true,
            antialias: true,
        });

        if (!this.glContext) {
            throw new Error("No WebGL present");
        }

        this.gl = new OpenGL(this.glContext, true);
        this.gl.enableShaders(ShaderMode.BLUR_CIRCLE);

        this.gl.setBackgroundColor(0, 0, 0);

        window.addEventListener('resize', () => this.setSize());
        this.setSize();
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

    private onError(error): void {
        this.errored = true;
        this.lastError = error;
        console.error(error);
        const context = this.animationCanvas.nativeElement.getContext('2d');
        context.clearRect(0, 0, this.animationCanvas.nativeElement.width, this.animationCanvas.nativeElement.height);

        context.font = "30px Verdana";
        context.fillStyle = "red";
        context.fillText("An internal OpenGL error occurred: " + error, 10, this.animationCanvas.nativeElement.height / 2);
    }

    //redraw the canvas
    private redraw(): void {
        if (this.errored) {
            this.onError(this.lastError);
        } else {
            this.gl.render();
        }
    }

    private setSize() {
        // fix to set correct canvas size
        setTimeout(() => {
            this.animationCanvas.nativeElement.width = this.animationCanvas.nativeElement.clientWidth;
            this.animationCanvas.nativeElement.height = this.animationCanvas.nativeElement.clientHeight;

            this.gl.resize(this.animationCanvas.nativeElement.width, this.animationCanvas.nativeElement.height);
            this.redraw();
        }, 100);
    };

    public animate(): void {
        /** @author Nico Klaassen */
        const self: WelcomePageComponent = this;

        // Release buffers when the animation is restarted
        this.gl.releaseBuffers();

        // check if we have to cancel a previous animation
        if (this.lastAnimationId != null) {
            cancelAnimationFrame(this.lastAnimationId);
        }

        this.setSize();

        const density = 200;// Number of circles
        const minSize = 2;  // Minimum radius
        const maxSize = 50; // Maximum radius
        const minV = 0.15;  // Minimum speed
        const maxV = 0.6;   // Maximum speed

        // Circle object to track positions
        function Circle(x, y, radius, dx, dy, centerX, centerY, biasX, biasY, variance, canvas, opengl) {
            this.opengl = opengl;
            this.canvas = canvas;
            this.x = x;
            this.y = y;
            this.centerX = centerX;
            this.centerY = centerY;
            this.biasX = biasX;
            this.biasY = biasY;
            this.radius = radius;
            this.dx = dx;
            this.dy = dy;
            this.color = 255;
            this.maxPull = 0.3 + variance;
            this.velMix = 0.2;
            this.alpha = Math.max(1 - Math.min(radius / (maxSize + minSize), 1.0), 0.3);
            this.glid = this.opengl.renderBlurryCircle(Math.max(this.radius - Math.pow(1 + 0.05 * this.radius, 5), 0), Math.pow(1 + 0.05 * this.radius, 4), this.alpha, [1, 1, 1]);

            // Method to draw the shape
            this.draw = function () {
                this.opengl.setPosition(this.glid, this.x, this.y);
            };

            // Method which calculates the next 'step' in the animation
            this.update = function() {
                if (Math.sqrt(Math.pow(this.x - this.centerX, 2) + Math.pow(this.y - this.centerY, 2)) > Math.min(this.opengl.getWidth() / 2, this.opengl.getHeight()) * 1.3) {
                    const pullX = (this.x - this.centerX) < 0 ?
                        Math.min(Math.abs(this.x - this.centerX) / 1000 * this.biasX, this.maxPull) :
                        -Math.min(Math.abs(this.x - this.centerX) / 1000 * this.biasX, this.maxPull) ;
                    this.dx = this.dx + pullX;

                    if (this.dx < 0) {
                        this.dx = Math.max(this.velMix * Math.max(this.dx, -this.maxPull) + (1-this.velMix) * this.dx, -maxV);
                    } else {
                        this.dx = Math.min(this.velMix * Math.min(this.dx, this.maxPull) + (1-this.velMix) * this.dx, maxV);
                    }

                    const pullY = (this.y - this.centerY) < 0 ?
                        Math.min(Math.abs(this.y - this.centerY) / 1000 * this.biasY, this.maxPull) :
                        -Math.min(Math.abs(this.y - this.centerY) / 1000 * this.biasY, this.maxPull) ;
                    this.dy = this.dy + pullY;

                    if (this.dy < 0) {
                        this.dy = Math.max(this.velMix * Math.max(this.dy, -this.maxPull) + (1-this.velMix) * this.dy, -maxV);
                    } else {
                        this.dy = Math.min(this.velMix * Math.min(this.dy, this.maxPull) + (1-this.velMix) * this.dy, maxV);
                    }
                }

                // Updating positions according to x and y velocities
                this.x += this.dx;
                this.y += this.dy;

                this.draw();
            };


        }

        const circles = [];

        const initCircles = () => {
            for (let i = 0; i < density; i++) {
                // Random shape parameters
                const radius = Math.random() * maxSize + minSize;

                const x = Math.random() * (this.gl.getWidth()) - this.gl.getWidth() / 2;
                const y = Math.random() * (this.gl.getHeight()) - this.gl.getHeight() / 2;

                // Random up/down and left/right
                const directionX = Math.random() > 0.5 ? -1 : 1;
                const directionY = Math.random() > 0.5 ? -1 : 1;

                // Gravity center
                const centerOffset = 200;
                const centerX = Math.random() * 3 * centerOffset - 3 * centerOffset / 2;
                const centerY = Math.random() * 3 * centerOffset - 3 * centerOffset / 2;

                // Pull bias
                const biasX = Math.random() / 2 + 0.5;
                const biasY = Math.random() / 2 + 0.5;

                // Random velocities
                const dx = Math.max(Math.random() * maxV, minV) * directionX;
                const dy = Math.max(Math.random() * maxV, minV) * directionY;

                // Variance
                const variance = 1 + (Math.random() - 0.5) / 10;

                circles[i] = new Circle(x, y, radius, dx, dy, centerX, centerY, biasX, biasY, variance, this.animationCanvas, this.gl);
            }
        };

        const animate = () => {
            this.lastAnimationId = requestAnimationFrame(animate);
            if (this.runAnimation) {
                // Init circles if they don't exist yet.
                if (circles.length == 0) {
                    initCircles();
                }

                // Update all the shapes for the next 'animation frame' / step
                for (let i = 0; i < circles.length; i++) {
                    const circle = circles[i];
                    circle.update();
                }

                this.redraw();
            } else {
                this.animationIsRunning = false;
            }
        };

        animate();
        /** @end-author Nico Klaassen */
    }
    /** @end-author Bart Wesselink */
}
