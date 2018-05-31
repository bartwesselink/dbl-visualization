/** @author Roan Hofland */
import {CircleShader} from "./circleShader";
import {Shader} from "../shader";
import {vertexSource} from "../vertex/interpolatingVertexShader";
import {fragmentSource} from "../fragment/linecircleFragmentShader";
import {Element} from "../../element";
import {OpenGL} from "../../opengl";
import {CircleElement} from "../elem/circleElement";

export class LineCircleShader extends CircleShader{
    private colorUniform: WebGLUniformLocation;
    private lineColorUniform: WebGLUniformLocation;
    private widthUniform: WebGLUniformLocation;
    
    public preInit(shader: Shader): WebGLProgram {
        return shader.initShader(vertexSource, fragmentSource);
    }
    
    public postProcess(elem: Element, gl: WebGLRenderingContext, opengl: OpenGL): void {
        gl.uniform3fv(this.colorUniform, elem.color);
        gl.uniform3fv(this.lineColorUniform, (elem as CircleElement).lineColor);
        gl.uniform1f(this.widthUniform, opengl.getZoom() * 0.002);
    }
    
    public postInit(gl: WebGLRenderingContext): void {
        this.colorUniform = gl.getUniformLocation(this.shader, "color");
        this.lineColorUniform = gl.getUniformLocation(this.shader, "lcolor");
        this.widthUniform = gl.getUniformLocation(this.shader, "width");
    }
}
/** @end-author Roan Hofland */ 