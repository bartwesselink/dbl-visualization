/** @author Roan Hofland */
import {CircleSliceShader} from "./circleSliceShader";
import {Shader} from "../shader";
import * as vertexSource from "raw-loader!../vertex/interpolatingVertexShader.glsl";
import * as fragmentSource from "raw-loader!../fragment/drawCircleSliceFragmentShader.glsl";
import {Element} from "../../element";
import {OpenGL} from "../../opengl";

export class DrawCircleSliceShader extends CircleSliceShader{
    private colorUniform: WebGLUniformLocation;
    
    public preInit(shader: Shader): WebGLProgram {
        console.log("bind draw circle slice");
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