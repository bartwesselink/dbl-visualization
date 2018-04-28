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
    private shader;
    private projectionMatrix;
    private modelviewMatrix;
    private lastError: string;
    private shaderAttribPosition;
    private shaderAttribColor;

    ngOnInit() {
        console.log("init");//TODO remove
        this.setHeight();
      
        this.init();
      
        this.redraw();

        window.onresize = () => this.setHeight();
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
    private render(gl: WebGLRenderingContext): void {
      console.log("render");//TODO remove
      this.clear();
      
      this.gl.viewport(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      
      this.projectionMatrix = this.createMatrix();

      this.perspective(this.projectionMatrix,
                       (45 * Math.PI) / 180, //fov, 45 degrees
                       this.gl.canvas.clientWidth / this.gl.canvas.clientHeight, //aspect ratio, TODO if the view port changes this needs to be updated
                       1, // z-axis near
                       -1); //z-axis far
      console.log("GL canvas: " + this.gl.canvas.clientWidth + " | " + this.gl.canvas.clientHeight);
      console.log("Actual canvas: " + this.canvas.nativeElement.width + " | " + this.canvas.nativeElement.height);
      
      this.modelviewMatrix = this.createMatrix();
      
      this.gl.useProgram(this.shader);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shader, "projectionMatrix"), false, this.projectionMatrix);
      this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shader, "modelviewMatrix"), false, this.modelviewMatrix);
      
      //static test drawing
      //position
      var positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      const pos = [ 1,  1, 
                   -0,  1, 
                    0, -1, 
                   -1, -1];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
      
      //color
      var colorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      const colors = [1, 0, 0, 1,
                      1, 0, 0, 1,
                      1, 0, 0, 1,
                      1, 0, 0, 1];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
            
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(this.shaderAttribPosition, //attribute
                             2, //2D so two values per iteration: x, y
                             gl.FLOAT, //data type is float32
                             false, //no normalisation
                             0, //stride = automatic
                             0); //skip
      gl.enableVertexAttribArray(this.shaderAttribPosition);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.vertexAttribPointer(this.shaderAttribColor, //attribute
                             4, //rgba so four values per iteration: r, g, b, a
                             gl.FLOAT, //data type is float32
                             false, //no normalisation
                             0, //stride = automatic
                             0); //skip
      gl.enableVertexAttribArray(this.shaderAttribColor);
      
      //note that triangles are used, but we are drawing a quad, this is because triangles are more efficient, offset = 0 and we are drawing 4 vertices
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
    }
  
    //initialise OpenGL
    private init(): void {
      this.gl = this.canvas.nativeElement.getContext('webgl');
      
      if(!this.gl){
        this.onError("No WebGL present");
        return;
      }
      
      this.initShaders();
       
      //set the canvas background color to 100% transparent black
      this.gl.clearColor(0.0, 0.0, 0.0, 1.0);//TODO change to transparent, but for now a black background helps to signal errors
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
        varying lowp vec4 vcolor;

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
          this.onError("Vertex shader compilation failed");
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
          this.onError("Fragment shader compilation failed");
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
      
      if(!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)){
        this.onError("Shader link status wrong");
        return;
      }
      
      //Initialise the shader object for use
      this.shader = program;
      this.shaderAttribPosition = this.gl.getAttribLocation(program, "pos");
      this.shaderAttribColor = this.gl.getAttribLocation(program, "color");
    }
  
    //clear the screen to white
    private clear(): void {
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
  
    //redraw canvas
    private redraw(): void {
       if(this.errored){
         this.onError(this.lastError);
       }else{
         this.render(this.gl);
       }
    }
  
    //translate the given matrix by the given vector
    private translateSelf(matrix, vector): void {
      this.translate(matrix, matrix, vector);
    }
  
    //===== Typescript translations of gl-matrix.js =====
    private translate(out, a, v): void {
      var x = v[0],
          y = v[1],
          z = v[2];
      var a00 = void 0,
          a01 = void 0,
          a02 = void 0,
          a03 = void 0;
      var a10 = void 0,
          a11 = void 0,
          a12 = void 0,
          a13 = void 0;
      var a20 = void 0,
          a21 = void 0,
          a22 = void 0,
          a23 = void 0;
      
      if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
      } else {
        a00 = a[0];a01 = a[1];a02 = a[2];a03 = a[3];
        a10 = a[4];a11 = a[5];a12 = a[6];a13 = a[7];
        a20 = a[8];a21 = a[9];a22 = a[10];a23 = a[11];
      
        out[0] = a00;out[1] = a01;out[2] = a02;out[3] = a03;
        out[4] = a10;out[5] = a11;out[6] = a12;out[7] = a13;
        out[8] = a20;out[9] = a21;out[10] = a22;out[11] = a23;
      
        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
      }
    }
  
    private createMatrix(): Float32Array {
      var out = new Float32Array(16);
      out[0] = 1;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = 1;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = 1;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
      out[15] = 1;
      return out;
    }
  
    private perspective(out, fovy, aspect, near, far): void {
      var f = 1.0 / Math.tan(fovy / 2);
      var nf = 1 / (near - far);
      out[0] = f / aspect;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = f;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = (far + near) * nf;
      out[11] = -1;
      out[12] = 0;
      out[13] = 0;
      out[14] = 2 * far * near * nf;
      out[15] = 0;
    }
    //========== End gl-matrix.js translations ==========
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
