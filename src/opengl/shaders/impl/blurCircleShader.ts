/** @author Roan Hofland */
import {CircleShader} from "./circleShader";
import {Shader} from "../shader";
import * as vertexSource from "raw-loader!../vertex/translatableVertexShader.glsl";
import * as fragmentSource from "raw-loader!../fragment/blurCircleFragmentShader.glsl";
import {Element} from "../../element";
import {OpenGL} from "../../opengl";

export class BlurCircleShader extends CircleShader{
    private colorUniform: WebGLUniformLocation;
    private blurUniform: WebGLUniformLocation;
    private alphaUniform: WebGLUniformLocation;
    
    public preInit(shader: Shader): WebGLProgram {
        return shader.initShader(vertexSource, fragmentSource);
    }
    
    public postProcess(elem: Element, gl: WebGLRenderingContext): void {
        gl.uniform3fv(this.colorUniform, elem.color);
        gl.uniform1f(this.blurUniform, 200.0);
        gl.uniform1f(this.alphaUniform, 1.0);
    }
    
    public postInit(gl: WebGLRenderingContext): void {
        this.colorUniform = gl.getUniformLocation(this.shader, "color");
        this.blurUniform = gl.getUniformLocation(this.shader, "blur");
        this.alphaUniform = gl.getUniformLocation(this.shader, "alpha");
    }
}
/** @end-author Roan Hofland */ 