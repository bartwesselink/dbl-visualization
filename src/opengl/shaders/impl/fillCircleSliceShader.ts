/** @author Roan Hofland */
import {CircleSliceShader} from "./circleSliceShader";
import {Shader} from "../shader";
import {vertexSource} from "../vertex/interpolatingVertexShader";
import {fragmentSource} from "../fragment/fillCircleSliceFragmentShader";
import {Element} from "../../element";
import {OpenGL} from "../../opengl";

export class FillCircleSliceShader extends CircleSliceShader{
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