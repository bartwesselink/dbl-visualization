import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

@Component({
    selector: 'app-window',
    templateUrl: './window.component.html',
})
export class WindowComponent implements OnInit {
    @ViewChild('canvas') private canvas: ElementRef;
    private context: CanvasRenderingContext2D;
  
    /** @author Roan Hofland */
    private gl: WebGLRenderingContext;
    private errored: boolean = false;

    ngOnInit() {
        this.init();
      
        this.setHeight();
        this.redraw();

        window.onresize = () => this.setHeight();
    }
  
    //fallback rendering for when some OpenGL error occurs
    private onError(): void {
       this.errored = true;
       this.context = this.canvas.nativeElement.getContext('2d');
       this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

       this.context.font = "30px Verdana";
       this.context.fillStyle = "red";
       this.context.fillText("An internal OpenGL error occurred!", 10, this.canvas.nativeElement.height / 2);
    }
  
    //draw OpenGL stuff
    private draw(): void {
      this.clear();
      //TODO OpenGL drawing
    }
  
    //initialise OpenGL
    private init(): void {
      this.gl = this.canvas.nativeElement.getContext('webgl');
      
      if(!this.gl){
        this.onError();
        return;
      }
      
      this.initShaders();
    }
  
    //initialises the shaders
    private initShaders(): void {
      //really simple minimal vertex shader
      //we just pass the color on the fragment shader and don't perform any transformations
      const vertexShaderSource = `
        attribute vec4 pos;
        attribute vec4 color;

        uniform mat4 modelviewMatrix;
        uniform mat4 projectionMatrix;

        varying lowp vec4 vcolor;
        
        void main() {
          gl_Position = modelviewMatrix * modelviewMatrix * pos;
          vcolor = color;
        }
      `;
      
      //really simple fragment shader that just assigns the color it gets from the vertex shader
      //without transforming it in any way.
      const fragmentShaderSource = `
        varing lowp vec4 vcolor;

        void main() {
          gl_FragColor = vcolor;
        }
      `;
      
      //just some generic shader loading
      var fragmentShader;
      var vertexShader;
      {
        const shader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(shader, vertexShaderSource);
        this.gl.compileShader(shader);
        if(!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)){
          this.onError();
          this.gl.deleteShader(shader);
          return;
        }else{
          vertexShader = shader;
        }
      }
      {
        const shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(shader, fragmentShaderSource);
        this.gl.compileShader(shader);
        if(!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)){
          this.onError();
          this.gl.deleteShader(shader);
          return;
        }else{
          fragmentShader = shader;
        }
      }
      
      //create a program using our vertex and fragment shader and link it
      const program = this.gl.createProgram();
      this.gl.attachShader(program, vertexShader);
      this.gl.attachShader(program, fragmentShader);
      this.gl.linkProgram(program);
      
      if(this.gl.getProgramParameter(program, this.gl.LINK_STATUS)){
        this.onError();
        return;
      }
      
      //TODO finish shader initialisation
    }
  
    //mini test render method for OpenGL
    private test(): void {
      //TODO
    }
  
    //clear the screen to white
    private clear(): void {
      this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
  
    //redraw canvas
    private redraw(): void {
       if(this.errored){
         this.onError();
       }else{
         this.draw();
       }
    }
    /** @end-author Roan Hofland */
    /** @author Bart Wesselink */
    private setHeight(): void {
        // fix to set correct canvas size
        setTimeout(() => {
            this.canvas.nativeElement.width = this.canvas.nativeElement.scrollWidth;
            this.canvas.nativeElement.height = this.canvas.nativeElement.scrollHeight;

            this.redraw();
        });
    }
    /** @end-author Bart Wesselink */
}
