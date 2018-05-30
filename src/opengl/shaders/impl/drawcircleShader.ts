/** @author Roan Hofland */
import {CircleShader} from "./circleShader";
import {Shader} from "../shader";
import {vertexSource} from "../vertex/circleVertexShader";
import {fragmentSource} from "../fragment/drawcircleFragmentShader";
import {Element} from "../../element";

export class DrawCircleShader extends CircleShader{
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