import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Element} from '../../opengl/element';
import {Matrix} from '../../opengl/matrix';
import {OpenGL} from '../../opengl/opengl';
import {Shader} from "../../opengl/shader";

@Component({
    selector: 'app-window',
    templateUrl: './window.component.html',
})
export class WindowComponent implements OnInit {
    @ViewChild('canvas') private canvas: ElementRef;
    private context: CanvasRenderingContext2D;
  
    /** @author Roan Hofland */
    private errored: boolean = false;
    private lastError: string;
    
    private gl: OpenGL;
    
    ngOnInit() {
        this.setHeight();
        
        this.init();
        this.computeScene();
        this.redraw();
        
        window.onresize = () => this.setHeight();
    }
    
    //compute the visualisation
    private computeScene(): void {
        this.gl.releaseBuffers();
        
        //test visualisation
        this.gl.drawAAQuad(0,    0,    100, 100, [1, 0, 0, 1]);
        this.gl.drawAAQuad(-100, -100, 100, 100, [0, 1, 0, 1]);
        this.gl.drawAAQuad(0,    -300, 200, 200, [0, 0, 1, 1]);
        
        //scalability hell test (change the limit)
        for(var i = 0; i < 10; i++){
            //recall that our viewport is fixed at 1600x900, but we will never need this fact except for this test case since visualisations can go beyond the viewport
            var x = (Math.random() - 0.5) * 1600;
            var y = (Math.random() - 0.5) * 900;
            this.gl.drawAAQuad(x, y, 50, 50, [Math.random(), Math.random(), Math.random(), Math.random()]);
        }
    }
  
    //fallback rendering for when some OpenGL error occurs
    private onError(error): void {
        this.errored = true;
        this.lastError = error;
        console.log(error);
        this.context = this.canvas.nativeElement.getContext('2d');
        this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
        
        this.context.font = "30px Verdana";
        this.context.fillStyle = "red";
        this.context.fillText("An internal OpenGL error occurred: " + error, 10, this.canvas.nativeElement.height / 2);
    }
  
    //draw OpenGL stuff
    private render(): void {
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
