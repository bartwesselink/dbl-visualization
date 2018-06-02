/** @author Roan Hofland */
import {Shader} from "../shader";
import {CircleSliceElement} from "../elem/circleSliceElement";
import {Element} from "../../element";
import {OpenGL} from "../../opengl";
import {CircleShader} from "./circleShader";

export abstract class CircleSliceShader extends CircleShader{
    private startUniform: WebGLUniformLocation; 
    private endUniform: WebGLUniformLocation;

    public init(shader: Shader, gl: WebGLRenderingContext): void{
        super.init(shader, gl);
        this.startUniform = gl.getUniformLocation(this.shader, "start");
        this.endUniform = gl.getUniformLocation(this.shader, "end");
        this.attribPosition = gl.getAttribLocation(this.shader, "pos");
    }
    
    public preProcess(elem: Element, gl: WebGLRenderingContext, opengl: OpenGL): void {
        super.preProcess(elem, gl, opengl);
        gl.uniform1f(this.startUniform, (elem as CircleSliceElement).start);
        gl.uniform1f(this.endUniform, (elem as CircleSliceElement).end);
    }
}
/** @end-author Roan Hofland */  