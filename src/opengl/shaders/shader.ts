/** @author Roan Hofland */
import {ShaderMode} from "./shaderMode";
import {FillCircleShader} from "./impl/fillcircleShader";
import {Element} from "../element";
import {Matrix} from "../matrix";
import {OpenGL} from "../opengl";
import {ShaderBase} from "./abstractShader";
import {DrawCircleShader} from "./impl/drawcircleShader";

export class Shader{
    private gl: WebGLRenderingContext;
    private opengl: OpenGL;
    private mode: number = 0;
    private currentMode: ShaderMode = null;
    private modelviewMatrix: Float32Array;
    private shader: ShaderBase;

    private fillCircleShader: FillCircleShader = null;
    private drawCircleShader: DrawCircleShader = null;

    constructor(gl: WebGLRenderingContext, opengl: OpenGL, mode: number){
        this.gl = gl;
        this.opengl = opengl;
        this.mode = mode;
        if((mode & ShaderMode.FILL_CIRCLE) > 0){
            this.fillCircleShader = new FillCircleShader();
            this.fillCircleShader.init(this, gl);
        }
        if((mode & ShaderMode.DRAW_CIRCLE) > 0){
            this.drawCircleShader = new DrawCircleShader();
            this.drawCircleShader.init(this, gl);
        }
    }
    
    public prepareRenderPass(): void{
        this.modelviewMatrix = this.opengl.getModelviewMatrix();
    }
    
    public switchShader(mode: ShaderMode): void{
        switch(mode){
        case ShaderMode.FILL_CIRCLE:
            this.setShader(this.fillCircleShader);
            break;
        case ShaderMode.DRAW_CIRCLE:
            this.setShader(this.drawCircleShader);
            break;
        }
        
        this.prepareRenderPass();
    }
    
    private setShader(shader: ShaderBase): void{
        this.gl.useProgram(shader.shader);
        this.shader = shader;
    }
    
    public renderElement(elem: Element): void {
        if(elem.mode != this.currentMode){
            this.switchShader(elem.mode);
        }
        
        this.shader.preProcess(elem, this.gl, this.opengl);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, elem.pos);
        this.gl.vertexAttribPointer(this.fillCircleShader.attribPosition,   //attribute
                                    2,                                      //2D so two values per iteration: x, y
                                    this.gl.FLOAT,                          //data type is float32
                                    false,                                  //no normalisation
                                    0,                                      //stride = automatic
                                    0);                                     //skip
        this.gl.enableVertexAttribArray(this.fillCircleShader.attribPosition);
        
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, elem.length);
    }
    
    public isShaderEnabled(mode: ShaderMode): boolean {
        return (this.mode & mode) > 0;
    }
    
    public initShader(vss: string, fss: string): WebGLProgram {
        var fragmentShader;
        var vertexShader;
        {
            const shader = this.gl.createShader(this.gl.VERTEX_SHADER);
            this.gl.shaderSource(shader, vss);
            this.gl.compileShader(shader);
            if(!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)){
                var log = this.gl.getShaderInfoLog(shader);
                console.log(log);
                this.gl.deleteShader(shader);
                throw new Error("Vertex shader compilation failed");
            }else{
                vertexShader = shader;
            }
        }
        {
            const shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
            this.gl.shaderSource(shader, fss);
            this.gl.compileShader(shader);
            if(!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)){
                var log = this.gl.getShaderInfoLog(shader);
                console.log(log);
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
            var log = this.gl.getProgramInfoLog(program);
            console.log(log);
            this.gl.deleteProgram(program);
            throw new Error("Shader link status wrong");
        }
        
        return program;
    }
}
/** @end-author Roan Hofland */  