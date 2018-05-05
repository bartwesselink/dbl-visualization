import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Element} from '../../opengl/element';
import {Matrix} from '../../opengl/matrix';
import {OpenGL} from '../../opengl/opengl';
import {Shader} from "../../opengl/shader";
import { Observable } from "rxjs";

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

        setTimeout(() => this.redraw(), 100);
        
        window.onresize = () => this.setHeight();
    }
        
    //compute the visualisation
    private computeScene(): void {
        this.gl.releaseBuffers();
        
        //test visualisations]
        this.gl.fillCircle(-500, 50, 50, [1, 0, 0, 1]);
        this.gl.drawCircle(-500, -100, 50, [0, 0, 0, 1]);
        this.gl.fillLinedCircle(-500, -250, 50, [1, 0, 0, 1], [0, 0, 0, 1]);

        this.gl.fillEllipsoid(-350, 50, 50, 30, 0, [1, 0, 0, 1]);
        this.gl.drawEllipsoid(-350, -100, 50, 30, 45, [0, 0, 0, 1]);
        this.gl.fillLinedEllipsoid(-350, -250, 50, 30, 135, [1, 0, 0, 1], [0, 0, 0, 1]);
        
        this.gl.fillAAQuad(0,    0,    100, 100, [1, 0, 0, 1]);
        this.gl.fillAAQuad(-100, -100, 100, 100, [0, 1, 0, 1]);
        this.gl.fillAAQuad(0,    -300, 200, 200, [0, 0, 1, 1]);
        
        this.gl.fillAAQuad(300,    0, 100, 100, [1, 0, 0, 1]);
        this.gl.fillLinedAAQuad(300, -300, 100, 100, [0, 1, 0, 1], [0, 0, 0, 1]);
        this.gl.drawAAQuad(300, -150, 100, 100, [0, 0, 1, 1]);
        
        for(var i = 0; i <= 36; i++){
             this.gl.fillLinedRotatedQuad(-800 + 25 + 43 * i, 200, 35, 35, i * 10, [1, 0, 0, 1], [0, 0, 0, 1]);
        }
        for(var i = 0; i <= 18; i++){
             this.gl.drawRotatedQuad(-800 + 25 + 86 * i, 300, 70, 35, i * 20, [1, 0, 0, 1]);
        }
                
        //scalability hell test (change the limit)
        for(var i = 0; i < 0; i++){
            //recall that our viewport is fixed at 1600x900, but we will never need this fact except for this test case since visualisations can go beyond the viewport
            var x = (Math.random() - 0.5) * 1600;
            var y = (Math.random() - 0.5) * 900;
            this.gl.fillAAQuad(x, y, 50, 50, [Math.random(), Math.random(), Math.random(), Math.random()]);
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
