/** @author Roan Hofland */
import {circleFragmentSource} from "./fragment/circleFragmentShader";
import {circleVertexSource} from "./vertex/circleVertexShader";
import {ShaderMode} from "./shaderMode";

export class Shader{
    private gl: WebGLRenderingContext;
    private mode: number;

    private fillCircleShader: WebGLProgram = null;

    public getShader(mode: ShaderMode): WebGLProgram {
        switch(mode){
        case ShaderMode.FILL_CIRCLE:
            return this.fillCircleShader;
        }
    }
    
    public isShaderEnabled(mode: ShaderMode): boolean {
        return (this.mode & mode) > 0;
    }
    
    public init(gl: WebGLRenderingContext, mode: number): void{
        this.gl = gl;
        this.mode = mode;
        
        if((mode & ShaderMode.FILL_CIRCLE) > 0){
            this.fillCircleShader = this.initShader(circleVertexSource, circleFragmentSource);
        }
        
    }
    
    private initShader(vss: string, fss: string): WebGLProgram {
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
        
        return program;
    }
}
/** @end-author Roan Hofland */  