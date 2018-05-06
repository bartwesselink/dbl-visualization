import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Element} from '../../opengl/element';
import {Matrix} from '../../opengl/matrix';
import {OpenGL} from '../../opengl/opengl';
import {Shader} from "../../opengl/shader";
import { Observable } from "rxjs";
import {Visualizer} from '../../interfaces/visualizer';
import {Node} from '../../models/node';
import {Tab} from '../../models/tab';

@Component({
    selector: 'app-window',
    templateUrl: './window.component.html',
})
export class WindowComponent implements OnInit {
    @ViewChild('canvas') private canvas: ElementRef;
    @Input('tree') private tree: Node;
    @Input('visualizer') private visualizer: Visualizer;
    @Input('tab') private tab: Tab;

    private context: CanvasRenderingContext2D;
  
    /** @author Roan Hofland */
    private errored: boolean = false;
    private lastError: string;
    
    private gl: OpenGL;
    
    private down: boolean = false;
    private lastX: number;
    private lastY: number;
    
    ngOnInit() {
        this.tab.window = this; // create reference in order to enable tab-manager to communicate with component

        this.setHeight();
        this.startScene();
        
        window.addEventListener('resize', () => this.setHeight())
    }
    
    public mouseDown(): void {
        this.down = true;
    }
    
    public mouseUp(): void {
        this.down = false;
    }
    
    public onDrag(event: MouseEvent): void {
        if(this.down){
            console.log("drag dx=" + (event.clientX - this.lastX) + " | dy=" + (event.clientY - this.lastY));
        }
        this.lastX = event.clientX;
        this.lastY = event.clientY;
    }

    public startScene(): void {
        this.init();
        this.computeScene();

        setTimeout(() => this.redraw(), 100);
    }

    public destroyScene(): void {
        this.gl.releaseBuffers();
    }
        
    //compute the visualisation
    private computeScene(): void {
        this.gl.releaseBuffers();

        if (!this.visualizer) {
            return;
        }

        this.visualizer.draw(this.tree, this.gl);
    }
  
    //fallback rendering for when some OpenGL error occurs
    private onError(error): void {
        this.errored = true;
        this.lastError = error;
        console.error(error);
        this.context = this.canvas.nativeElement.getContext('2d');
        this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
        
        this.context.font = "30px Verdana";
        this.context.fillStyle = "red";
        this.context.fillText("An internal OpenGL error occurred: " + error, 10, this.canvas.nativeElement.height / 2);
    }
  
    //draw OpenGL stuff
    public render(): void {
        this.gl.render();
    }
  
    //initialise OpenGL
    private init(): void {
        var gl: WebGLRenderingContext = this.canvas.nativeElement.getContext('webgl', {preserveDrawingBuffer: true});
        
        if(!gl){
            this.onError("No WebGL present");
            return;
        }
        
        this.gl = new OpenGL(gl);
        
        try{
            //a bit redundant right now, but useful if we ever want to implement more shaders
            var shader: Shader = this.gl.initShaders();
            this.gl.useShader(shader);
        }catch(error){
            this.onError((<Error>error).message);   
        }  
    }
  
    //redraw the canvas
    private redraw(): void {
        if(this.errored){
            this.onError(this.lastError);
        }else{
            this.render();
        }
    }
    /** @end-author Roan Hofland */
    /** @author Bart Wesselink */
    private setHeight(): void {
        // fix to set correct canvas size
        setTimeout(() => {
            this.canvas.nativeElement.width = this.canvas.nativeElement.scrollWidth;
            this.canvas.nativeElement.height = this.canvas.nativeElement.scrollHeight;

            this.gl.resize(this.canvas.nativeElement.width, this.canvas.nativeElement.height);
            this.redraw();
        });
    }
    /** @end-author Bart Wesselink */
}
