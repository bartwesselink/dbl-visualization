/** @author Roan Hofland */
import {ShaderMode} from "./shaderMode";
import {FillCircleShader} from "./impl/fillCircleShader";
import {Element} from "../element";
import {Matrix} from "../matrix";
import {OpenGL} from "../opengl";
import {ShaderBase} from "./abstractShader";
import {DrawCircleShader} from "./impl/drawCircleShader";
import {LineCircleShader} from "./impl/lineCircleShader";
import {CopyShader} from "./impl/copyShader";
import {FillCircleSliceShader} from "./impl/fillCircleSliceShader";
import {FillRingSliceShader} from "./impl/fillRingSliceShader";
import {DrawCircleSliceShader} from "./impl/drawCircleSliceShader";
import {DrawRingSliceShader} from "./impl/drawRingSliceShader";

export class Shader{
    private gl: WebGLRenderingContext;
    private opengl: OpenGL;
    private mode: number = 0;
    private currentShaderMode: ShaderMode = null;
    private modelviewMatrix: Float32Array;
    private shader: ShaderBase;

    private copyShader: CopyShader = null;

    private fillCircleShader: FillCircleShader = null;
    private drawCircleShader: DrawCircleShader = null;
    private lineCircleShader: LineCircleShader = null;
    private fillCircleSliceShader: FillCircleSliceShader = null;
    private fillRingSliceShader: FillRingSliceShader = null;
    private drawCircleSliceShader: DrawCircleSliceShader = null;
    private drawRingSliceShader: DrawRingSliceShader = null;

    constructor(gl: WebGLRenderingContext, opengl: OpenGL, mode: number){
        this.gl = gl;
        this.opengl = opengl;
        this.mode = mode;
        this.copyShader = new CopyShader();
        this.copyShader.init(this, this.gl);
        this.setShader(this.copyShader);
        this.enable(mode);
    }
    
    private enableShader(shader: ShaderMode): void{
        this.enable(shader);
    }
    
    private enable(mode: number): void{
        if((mode & ShaderMode.FILL_CIRCLE) > 0){
            this.fillCircleShader = new FillCircleShader();
            this.fillCircleShader.init(this, this.gl);
        }
        if((mode & ShaderMode.DRAW_CIRCLE) > 0){
            this.drawCircleShader = new DrawCircleShader();
            this.drawCircleShader.init(this, this.gl);
        }
        if((mode & ShaderMode.LINED_CIRCLE) > 0){
            this.lineCircleShader = new LineCircleShader();
            this.lineCircleShader.init(this, this.gl);
        }
        if((mode & ShaderMode.FILL_CIRCLE_SLICE) > 0){
            this.fillCircleSliceShader = new FillCircleSliceShader();
            this.fillCircleSliceShader.init(this, this.gl);
        }
        if((mode & ShaderMode.DRAW_CIRCLE_SLICE) > 0){
            this.drawCircleSliceShader = new DrawCircleSliceShader();
            this.drawCircleSliceShader.init(this, this.gl);
        }
        if((mode & ShaderMode.FILL_RING_SLICE) > 0){
            this.fillRingSliceShader = new FillRingSliceShader();
            this.fillRingSliceShader.init(this, this.gl);
        }
        if((mode & ShaderMode.DRAW_RING_SLICE) > 0){
            this.drawRingSliceShader = new DrawRingSliceShader();
            this.drawRingSliceShader.init(this, this.gl);
        }
    }
    
    public prepareRenderPass(): void{
        this.modelviewMatrix = this.opengl.getModelviewMatrix();
        this.prepareShader();
    }
    
    private prepareShader(): void{
        if(this.shader != null){
            this.gl.uniformMatrix4fv(this.shader.modelviewUniform, false, this.modelviewMatrix);
        }
    }
    
    public switchShader(mode: ShaderMode): void{
        switch(mode){
        case ShaderMode.FILL_CIRCLE:
            this.setShader(this.fillCircleShader);
            break;
        case ShaderMode.DRAW_CIRCLE:
            this.setShader(this.drawCircleShader);
            break;
        case ShaderMode.LINED_CIRCLE:
            this.setShader(this.lineCircleShader);
            break;
        case ShaderMode.FILL_CIRCLE_SLICE:
            this.setShader(this.fillCircleSliceShader);
            break;
        case ShaderMode.DRAW_CIRCLE_SLICE:
            console.log("render set to slice");
            this.setShader(this.drawCircleSliceShader);
            break;
        case ShaderMode.FILL_RING_SLICE:
            console.log("set shader ring slice: " + this.fillRingSliceShader);
            this.setShader(this.fillRingSliceShader);
            break;
        case ShaderMode.DRAW_RING_SLICE:
            this.setShader(this.drawRingSliceShader);            
            break;
        }
        
        this.currentShaderMode = mode;
        this.prepareShader();
    }
    
    private setShader(shader: ShaderBase): void{
        this.gl.useProgram(shader.shader);
        this.shader = shader;
    }
    
    public bindDefault(): void {
        if(this.currentShaderMode != null){
            this.setShader(this.copyShader);
            this.currentShaderMode = null;
            this.prepareShader();
        }
    }
    
    public preProcess(elem: Element){
        this.shader.preProcess(elem, this.gl, this.opengl);
    }
    
    public defaultAttribPosition(): number{
        return this.shader.attribPosition;
    }
    
    public renderElement(elem: Element): number {
        if(elem.shader != this.currentShaderMode){
            this.switchShader(elem.shader);
        }
        
        this.preProcess(elem);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, elem.pos);
        this.gl.vertexAttribPointer(this.shader.attribPosition, //attribute
                                    2,                          //2D so two values per iteration: x, y
                                    this.gl.FLOAT,              //data type is float32
                                    false,                      //no normalisation
                                    0,                          //stride = automatic
                                    0);                         //skip
        this.gl.enableVertexAttribArray(this.shader.attribPosition);
        
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, elem.length);
        return elem.length;
    }
    
    public isShaderEnabled(mode: ShaderMode): boolean {
        return (this.mode & mode) > 0 && mode != 0;
    }
    
    public initShader(vss: any, fss: any): WebGLProgram {
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
