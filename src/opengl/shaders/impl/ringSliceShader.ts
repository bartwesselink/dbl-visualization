/** @author Roan Hofland */
import {Shader} from "../shader";
import {RingSliceElement} from "../elem/ringSliceElement";
import {Element} from "../../element";
import {OpenGL} from "../../opengl";
import {CircleSliceShader} from "./circleSliceShader";

export abstract class RingSliceShader extends CircleSliceShader{
    private nearUniform: WebGLUniformLocation;

    public init(shader: Shader, gl: WebGLRenderingContext): void{
        super.init(shader, gl);
        
        this.nearUniform = gl.getUniformLocation(this.shader, "near");
    }
    
    public preProcess(elem: Element, gl: WebGLRenderingContext, opengl: OpenGL): void {
        super.preProcess(elem, gl, opengl);

        gl.uniform1f(this.nearUniform, (elem as RingSliceElement).near);
    }
}
/** @end-author Roan Hofland */  