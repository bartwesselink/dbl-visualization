/** @author Roan Hofland */
import {Shader} from "../shader";
import * as vertexSource from "raw-loader!../vertex/interpolatingVertexShader.glsl";
import * as fragmentSource from "raw-loader!../fragment/circularArcFragmentShader.glsl";
import {Element} from "../../element";
import {OpenGL} from "../../opengl";
import {CircleSliceShader} from "./circleSliceShader";

export class CircularArcShader extends CircleSliceShader{
    private colorUniform: WebGLUniformLocation;
    
    public preInit(shader: Shader): WebGLProgram {
        return shader.initShader(vertexSource, fragmentSource);
    }
    
    public postProcess(elem: Element, gl: WebGLRenderingContext): void {
        gl.uniform3fv(this.colorUniform, elem.color);
    }
    
    public postInit(gl: WebGLRenderingContext): void {
        this.colorUniform = gl.getUniformLocation(this.shader, "color");
    }
}
/** @end-author Roan Hofland */ 