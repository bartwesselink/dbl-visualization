/** @author Roan Hofland */
import {Shader} from "./shader";
import {Element} from "./element";
import {Matrix} from "./matrix";

export class OpenGL{
    private gl: WebGLRenderingContext;
    private shader: Shader;
    private projectionMatrix;
    private arrays: Element[] = [];
    private readonly WIDTH = 1600;
    private readonly HEIGHT = 900;
    private readonly HALFWIDTH = this.WIDTH / 2;
    private readonly HALFHEIGHT = this.HEIGHT / 2;
    
    constructor(gl: WebGLRenderingContext){
        this.gl = gl;
        
        //set the canvas background color to 100% transparent black
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        
        this.projectionMatrix = Matrix.createMatrix();
        
        //note that we force a 16:9 effective viewport later on so this never changes
        Matrix.perspective(this.projectionMatrix,
                           (45 * Math.PI) / 180,                                     //fov, 45 degrees
                           this.gl.canvas.clientWidth / this.gl.canvas.clientHeight, //aspect ratio
                           1,                                                        //z-axis near
                           -1);                                                      //z-axis far
        
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.enable(this.gl.BLEND);
        this.gl.depthFunc(gl.LEQUAL);
        this.gl.enable(gl.DEPTH_TEST);   
    }
    
    //resizes the viewport to the optimal size for the new canvas size
    public resize(width: number, height: number): void {
        //maintain the viewport aspect ratio at 16:9 and center the viewport as a 16:9 rectangle in the center of the actual canvas making sure to
        //position the viewport in such a way that it covers the entire canvas
        //by forcing a 16:9 viewport we can make sure that even when the canvas is resized our buffers remain correct so that 
        //the visualisation does not distort. Theoretically we could also recompute all the buffers and map to a new coordinate space.
        if((width / this.WIDTH) * this.HEIGHT > height){
            this.gl.viewport(0, (height - ((width / this.WIDTH) * this.HEIGHT)) / 2, width, (width / this.WIDTH) * this.HEIGHT);
        }else{
            this.gl.viewport((width - ((height / this.HEIGHT) * this.WIDTH)) / 2, 0, (height / this.HEIGHT) * this.WIDTH, height);
        }
    }
    
    //render the OpenGL scene
    public render(): void {
        this.clear();
        
        //the model view matrix will later be used for user interaction
        var modelviewMatrix = Matrix.createMatrix();
        
        this.gl.useProgram(this.shader.shader);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shader.shader, "projectionMatrix"), false, this.projectionMatrix);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shader.shader, "modelviewMatrix"), false, modelviewMatrix);
        
        this.drawBuffers();
    }
    
    //sets the shader to use
    public useShader(shader: Shader): void {
        this.shader = shader;
    }
    
    //releases all the OpenGL buffers
    public releaseBuffers(): void {
        while(this.arrays.length > 0){
            var elem = this.arrays.pop();
            this.gl.deleteBuffer(elem.color);
            this.gl.deleteBuffer(elem.pos);
            this.gl.deleteBuffer(elem.indices);
        }
    }
    
    //fill a rotated quad
    public fillRotatedQuad(x: number, y: number, width: number, height: number, rotation: number, color: number[]): void {
        this.renderRotatedQuad(x,             y,
                               x - width / 2, y + height / 2,
                               x + width / 2, y + height / 2,
                               x - width / 2, y - height / 2,
                               x + width / 2, y - height / 2,
                               rotation, true, false, color, null);
    }
    
     //draw a rotated quad
    public drawRotatedQuad(x: number, y: number, width: number, height: number, rotation: number, color: number[]): void {
        this.renderRotatedQuad(x,             y,
                               x - width / 2, y + height / 2,
                               x + width / 2, y + height / 2,
                               x + width / 2, y - height / 2,
                               x - width / 2, y - height / 2,
                               rotation, false, true, null, color);
    }
    
     //render a rotated quad
    public fillLinedRotatedQuad(x: number, y: number, width: number, height: number, rotation: number, fillColor: number[], lineColor: number[]): void {
        this.renderRotatedQuad(x,             y,
                               x - width / 2, y + height / 2,
                               x + width / 2, y + height / 2,
                               x - width / 2, y - height / 2,
                               x + width / 2, y - height / 2,
                               rotation, true, true, fillColor, lineColor);
    }
    
    //renders a rotated quad
    private renderRotatedQuad(x: number, y: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, rotation: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[]): void {
        //a---------b
        //|   x,y   |
        //c---------d
        var center = [x, y];
        var a = Matrix.rotateVector2D(center, [x1, y1], rotation);
        var b = Matrix.rotateVector2D(center, [x2, y2], rotation);
        var c = Matrix.rotateVector2D(center, [x3, y3], rotation);
        var d = Matrix.rotateVector2D(center, [x4, y4], rotation);
        
        this.drawQuadImpl(b[0], b[1],
                          a[0], a[1],
                          d[0], d[1],
                          c[0], c[1],
                          fill, line, fillColor, lineColor);
    }
    
    //fill an axis aligned quad
    public fillAAQuad(x: number, y: number, width: number, height: number, color: number[]): void {
        this.drawQuadImpl(x + width, y + height,
                          x,         y + height,
                          x + width, y,
                          x,         y,
                          true, false, color, null);
    }
    
    //draw an axis aligned quad
    public drawAAQuad(x: number, y: number, width: number, height: number, color: number[]): void {
       this.drawQuadImpl(x + width, y + height,
                         x,         y + height,
                         x,         y,
                         x + width, y,
                         false, true, null, color);
    }
    
    //render an axis aligned quad
    public fillLinedAAQuad(x: number, y: number, width: number, height: number, fillColor: number[], lineColor: number[]): void {
        this.drawQuadImpl(x + width, y + height,
                          x,         y + height,
                          x + width, y,
                          x,         y,
                          true, true, fillColor, lineColor);
    }
        
    //draw quad implementation
    private drawQuadImpl(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, fill: boolean, line: boolean, fillColor: number[], lineColor: number[]): void {
        //position
        var positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        const pos = [x1 / this.HALFWIDTH,  y1 / this.HALFHEIGHT, 
                     x2 / this.HALFWIDTH,  y2 / this.HALFHEIGHT, 
                     x3 / this.HALFWIDTH,  y3 / this.HALFHEIGHT, 
                     x4 / this.HALFWIDTH,  y4 / this.HALFHEIGHT];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(pos), this.gl.STATIC_DRAW);
      
        //color
        var colorBuffer = null;
        if(fill){
            colorBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
            const colors = [fillColor[0], fillColor[1], fillColor[2], fillColor[3],
                            fillColor[0], fillColor[1], fillColor[2], fillColor[3],
                            fillColor[0], fillColor[1], fillColor[2], fillColor[3],
                            fillColor[0], fillColor[1], fillColor[2], fillColor[3]];
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
        }
        
        if(!line){
            this.arrays.push({
                pos: positionBuffer,
                color: colorBuffer,
                mode: this.gl.TRIANGLE_STRIP,
                length: 4
            });
        }else{
            var lineColorBuffer = null;
            if(lineColor == null){
                lineColorBuffer = colorBuffer;
            }else{
                //color
                lineColorBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, lineColorBuffer);
                const colors = [lineColor[0], lineColor[1], lineColor[2], lineColor[3],
                                lineColor[0], lineColor[1], lineColor[2], lineColor[3],
                                lineColor[0], lineColor[1], lineColor[2], lineColor[3],
                                lineColor[0], lineColor[1], lineColor[2], lineColor[3]];
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
            }
            
            if(line && fill){
                //indices
                var indicesBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
                this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint8Array([0, 2, 3, 1]), this.gl.STATIC_DRAW);
                
                this.arrays.push({
                    pos: positionBuffer,
                    color: colorBuffer,
                    mode: this.gl.TRIANGLE_STRIP,
                    length: 4,
                    overlay: {
                        pos: positionBuffer,
                        indices: indicesBuffer,
                        color: lineColorBuffer,
                        mode: this.gl.LINE_LOOP,
                        length: 4
                    }
                });
            }else{
                this.arrays.push({
                    pos: positionBuffer,
                    color: lineColorBuffer,
                    mode: this.gl.LINE_LOOP,
                    length: 4
                });
            }
        }
    }
    
    //clear the screen
    private clear(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
    
    //draw all the OpenGL buffers
    private drawBuffers(): void {
        for(var i = 0; i < this.arrays.length; i++){
            this.drawElement(this.arrays[i]);
        }
    }
    
    //renders the given element
    private drawElement(elem: Element): void {
        if(elem.pos != null){
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, elem.pos);
            this.gl.vertexAttribPointer(this.shader.shaderAttribPosition,             //attribute
                                        2,                                            //2D so two values per iteration: x, y
                                        this.gl.FLOAT,                                //data type is float32
                                        false,                                        //no normalisation
                                        0,                                            //stride = automatic
                                        elem.offset == null ? 0 : elem.offset);       //skip
            this.gl.enableVertexAttribArray(this.shader.shaderAttribPosition);
        }
        
        if(elem.color != null){
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, elem.color);
            this.gl.vertexAttribPointer(this.shader.shaderAttribColor,                //attribute
                                        4,                                            //rgba so four values per iteration: r, g, b, a
                                        this.gl.FLOAT,                                //data type is float32
                                        false,                                        //no normalisation
                                        0,                                            //stride = automatic
                                        elem.offset == null ? 0 : (elem.offset * 2)); //skip
            this.gl.enableVertexAttribArray(this.shader.shaderAttribColor);
        }
        
        if(elem.indices == null){
            this.gl.drawArrays(elem.mode, 0, elem.length);
        }else{
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, elem.indices);
            this.gl.drawElements(elem.mode, elem.length, this.gl.UNSIGNED_BYTE, 0);
        }
        
        if(elem.overlay != null){
            this.drawElement(elem.overlay);
        }
    }
    
    //initialises the shaders
    public initShaders(): Shader {
        //really simple minimal vertex shader
        //we just pass the color on to the fragment shader and don't perform any transformations
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
                this.gl.deleteShader(shader);
                throw new Error("Vertex shader compilation failed");
            }else{
                vertexShader = shader;
            }
        }
        {
            const shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
            this.gl.shaderSource(shader, fragmentShaderSource);
            this.gl.compileShader(shader);
            if(!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)){
                this.gl.deleteShader(shader);
                throw new Error("Fragment shader compilation failed");
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
            throw new Error("Shader link status wrong");
        }
        
        //Initialise the shader object for use
        return{
            shader: program,
            shaderAttribPosition: this.gl.getAttribLocation(program, "pos"),
            shaderAttribColor: this.gl.getAttribLocation(program, "color")
        }
    }
}
/** @end-author Roan Hofland */     