/** @author Roan Hofland */
import {CircleShader} from "./circleShader";
import {Shader} from "../shader";
import * as vertexSource from "raw-loader!../vertex/translatableVertexShader.glsl";
import * as fragmentSource from "raw-loader!../fragment/blurCircleFragmentShader.glsl";
import {Element} from "../../element";
import {OpenGL} from "../../opengl";
import {BlurCircleElement} from "../elem/blurCircleElement";

export class BlurCircleShader extends CircleShader{
    private colorUniform: WebGLUniformLocation;
    private blurUniform: WebGLUniformLocation;
    private alphaUniform: WebGLUniformLocation;
    
    public preInit(shader: Shader): WebGLProgram {
        return shader.initShader(vertexSource, fragmentSource);
    }
    
    public postProcess(elem: Element, gl: WebGLRenderingContext): void {
        gl.uniform3fv(this.colorUniform, elem.color);
        console.log(elem);
        gl.uniform1f(this.blurUniform, (elem as BlurCircleElement).blur);
        gl.uniform1f(this.alphaUniform, (elem as BlurCircleElement).alpha);
    }
    
    public postInit(gl: WebGLRenderingContext): void {
        this.colorUniform = gl.getUniformLocation(this.shader, "color");
        this.blurUniform = gl.getUniformLocation(this.shader, "blur");
        this.alphaUniform = gl.getUniformLocation(this.shader, "alpha");
    }
    
    public getElementX(elem: Element){
        return (elem as BlurCircleElement).cx;
    }
    
    public getElementY(elem: Element){
        return (elem as BlurCircleElement).cy;
    }
}
/** @end-author Roan Hofland */ 