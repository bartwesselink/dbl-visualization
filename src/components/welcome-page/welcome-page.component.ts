import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Visualizer} from '../../interfaces/visualizer';
import {WindowComponent} from '../window/window.component';
import {OpenGL} from "../../opengl/opengl";
import {CircleShader} from "../../opengl/shaders/impl/circleShader";
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

    private animationIsRunning: boolean = true;
    private hasGpu: boolean = false;

    public fullScreenAnimation: boolean = true;
    @Input() set showApp(showApp: boolean) {
        this.fullScreenAnimation = showApp;

        setTimeout(() => this.animate());
    }

    private lastAnimationId: number;
    private gl: OpenGL;
    private glContext: WebGLRenderingContext;
    private errored: boolean = false;
    private lastError: string;
    private counter: number = 0;

    public getThumbnails(): string[] {
        return this.visualizers.filter((item: Visualizer) => item.getThumbnailImage() !== null)
            .map((item) => item.getThumbnailImage());
    }

    public ngOnInit(): void {
        this.glContext = this.animationCanvas.nativeElement.getContext('webgl2', {
            preserveDrawingBuffer: false,
            depth: true,
            alpha: false,
            antialias: true,
        });

        if (!this.glContext) {
            throw new Error("No WebGL present");
        }

        this.gl = new OpenGL(this.glContext);
        this.gl.enableShaders(ShaderMode.FILL_CIRCLE);
        this.gl.setBackgroundColor(74/255, 115/255, 255/255);
        window.addEventListener('resize', () => this.setSize());
        this.setSize();


        // try {
        //     let gl = WindowComponent.createGL(this.openGlCheckCanvas);
        //
        //     this.hasGpu = gl.isDedicatedGPU();
        //
        //     gl = null;
        //     this.openGlCheckCanvas.nativeElement.remove();
        // } catch (error) {
        //     this.hasGpu = false;
        // }

        // this.animate();
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
            this.gl.setBackgroundColor(1, 0, 0);
            this.gl.render();
        }
    }

    private setSize() {
        console.log("resizing!");
        // fix to set correct canvas size
        setTimeout(() => {
            this.animationCanvas.nativeElement.width = this.animationCanvas.nativeElement.clientWidth;
            this.animationCanvas.nativeElement.height = this.animationCanvas.nativeElement.clientHeight;
            console.log(this.animationCanvas.nativeElement.width);
            console.log(this.animationCanvas.nativeElement.height);

            this.gl.resize(this.animationCanvas.nativeElement.width, this.animationCanvas.nativeElement.height);
            this.redraw();
        }, 100);
    };

    public animate(): void {
        /** @author Nico Klaassen */
        const self: WelcomePageComponent = this;

        // check if we have to cancel a previous animation
        if (this.lastAnimationId != null) {
            cancelAnimationFrame(this.lastAnimationId);
        }

        this.setSize();
        console.log(this.gl);
        const density = 10;// Number of circles
        const minSize = 2;  // Minimum radius
        const maxSize = 40; // Maximum radius
        const minV = 0.08;  // Minimum speed
        const maxV = 0.6;   // Maximum speed

        // Circle object to track positions
        function Circle(x, y, radius, dx, dy, centerX, centerY, biasX, biasY, canvas, opengl) {
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
            this.maxPull = 3;
            this.alpha = Math.max(1 - Math.min(radius / (maxSize + minSize), 1.0), 0.2);

            // Method to draw the shape
            this.draw = function () {
                this.opengl.fillCircle(this.x, this.y, this.radius, [1, 1, 1]);
            };

            // Method which calculates the next 'step' in the animation
            this.update = function() {
                // Gravitate to center - calculate new velocity
                const distance = Math.sqrt(Math.pow(this.x - this.centerX, 2) + Math.pow(this.y - this.centerY, 2));
                const pullX = (this.x - this.centerX) < 0 ?
                    Math.min(Math.abs(this.x - this.centerX) * distance / 1000 * this.biasX, this.maxPull) :
                    -Math.min(Math.abs(this.x - this.centerX) * distance / 1000 * this.biasX, this.maxPull) ;
                const pullY = (this.y - this.centerY) < 0 ?
                    Math.min(Math.abs(this.y - this.centerY) * distance / 1000 * this.biasY, this.maxPull) :
                    -Math.min(Math.abs(this.y - this.centerY) * distance / 1000 * this.biasY, this.maxPull) ;
                this.dx = this.dx + pullX;
                this.dy = this.dy + pullY;
                console.log("DD");
                console.log(this.dx);
                console.log(this.dy);
                // Updating positions according to x and y velocities
                this.x += this.dx;
                this.y += this.dy;
                console.log("coord: " + this.x + " - " + this.y);

                this.draw();
            };


        }

        const circles = [];

        const initCircles = () => {
            for (let i = 0; i < density; i++) {
                // Random shape parameters
                const radius = Math.random() * maxSize + minSize;
                console.log(this.animationCanvas.nativeElement.width);
                console.log(this.animationCanvas.nativeElement.height);
                const x = Math.random() * (this.animationCanvas.nativeElement.width / 2) - this.animationCanvas.nativeElement.width / 4;
                const y = Math.random() * (this.animationCanvas.nativeElement.height / 2) - this.animationCanvas.nativeElement.height / 4;

                // Random up/down and left/right
                const directionX = Math.random() > 0.5 ? -1 : 1;
                const directionY = Math.random() > 0.5 ? -1 : 1;

                // Gravity center
                const centerX = Math.random() * 3 * 25 - 3 * 12.5;
                const centerY = Math.random() * 3 * 25 - 3 * 12.5;

                // Pull bias
                const biasX = Math.random() / 2 + 0.5;
                const biasY = Math.random() / 2 + 0.5;

                // Random velocities
                const dx = Math.max(Math.random() * maxV, minV) * directionX;
                const dy = Math.max(Math.random() * maxV, minV) * directionY;

                circles[i] = new Circle(x, y, radius, dx, dy, centerX, centerY, biasX, biasY, this.animationCanvas, this.gl);
            }
        };

        const animate = () => {
            this.lastAnimationId = requestAnimationFrame(animate);
            if (this.runAnimation) {
                if (this.counter < 0) {
                    this.counter++;
                } else {
                    this.counter = 0;
                    // c.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight); // Clear canvas
                    this.gl.releaseBuffers();

                    // BG to check size
                    console.log("quadcoord: " + this.gl.transformPoint(0, 0));
                    this.gl.fillAAQuad(-this.animationCanvas.nativeElement.width / 8, -this.animationCanvas.nativeElement.height / 8, this.animationCanvas.nativeElement.width / 4, this.animationCanvas.nativeElement.height / 4,[.8, .8, .8]);
                    if (circles.length == 0) {
                        initCircles();
                    }
                    // Grid from circle to debug canvas position if needed.
                    for (let i = 0; i < 50; i++) {
                        for (let j = 0; j < 50; j++) {
                            this.gl.fillCircle(i*20, j*20, 0.5 * ((i % 2) + 1), [1, 1, 1]);
                        }
                    }

                    // Update all the shapes for the next 'animation frame' / step
                    for (let i = 0; i < circles.length; i++) {
                        const circle = circles[i];
                        circle.update();
                    }
                    this.redraw();
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
