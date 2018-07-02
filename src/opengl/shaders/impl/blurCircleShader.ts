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
    private dxUniform: WebGLUniformLocation;
    private dyUniform: WebGLUniformLocation;
    
    public preInit(shader: Shader): WebGLProgram {
        return shader.initShader(vertexSource, fragmentSource);
    }
    
    public postProcess(elem: Element, gl: WebGLRenderingContext): void {
        gl.uniform3fv(this.colorUniform, elem.color);
        console.log(elem);
        gl.uniform1f(this.blurUniform, (elem as BlurCircleElement).blur);
        gl.uniform1f(this.alphaUniform, (elem as BlurCircleElement).alpha);
        gl.uniform1f(this.dxUniform, (elem as BlurCircleElement).dx);
        gl.uniform1f(this.dyUniform, (elem as BlurCircleElement).dy);
    }
    
    public postInit(gl: WebGLRenderingContext): void {
        this.colorUniform = gl.getUniformLocation(this.shader, "color");
        this.blurUniform = gl.getUniformLocation(this.shader, "blur");
        this.alphaUniform = gl.getUniformLocation(this.shader, "alpha");
        this.dxUniform = gl.getUniformLocation(this.shader, "dx");
        this.dyUniform = gl.getUniformLocation(this.shader, "dy");
    }
}
/** @end-author Roan Hofland */ 