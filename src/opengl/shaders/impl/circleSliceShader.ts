/** @author Roan Hofland */
import {Shader} from "../shader";
import {CircleSliceElement} from "../elem/circleSliceElement";
import {Element} from "../../element";
import {OpenGL} from "../../opengl";
import {CircleShader} from "./circleShader";
import {Matrix} from "../../matrix";

export abstract class CircleSliceShader extends CircleShader{
    private startUniform: WebGLUniformLocation; 
    private endUniform: WebGLUniformLocation;
    private dxUniform: WebGLUniformLocation;
    private dyUniform: WebGLUniformLocation;

    public init(shader: Shader, gl: WebGLRenderingContext): void{
        super.init(shader, gl);
        this.startUniform = gl.getUniformLocation(this.shader, "start");
        this.endUniform = gl.getUniformLocation(this.shader, "end");
        this.dxUniform = gl.getUniformLocation(this.shader, "dx");
        this.dyUniform = gl.getUniformLocation(this.shader, "dy");
    }
    
    public preProcess(elem: Element, gl: WebGLRenderingContext, opengl: OpenGL): void {
        super.preProcess(elem, gl, opengl);
        
        var r = opengl.getRotation() * Matrix.oneDeg % (2.0 * Math.PI);
        var start = (elem as CircleSliceElement).start;
        var end = (elem as CircleSliceElement).end;   
        
        gl.uniform1f(this.startUniform, start);
        gl.uniform1f(this.endUniform, end);
        gl.uniform1f(this.dxUniform, opengl.getDX() * opengl.getZoom());
        gl.uniform1f(this.dyUniform, opengl.getDY() * opengl.getZoom());
    }
    
    public getElementX(elem: Element){
        return (elem as CircleSliceElement).cx == null ? elem.x : (elem as CircleSliceElement).cx;
    }
    
    public getElementY(elem: Element){
        return (elem as CircleSliceElement).cy == null ? elem.y : (elem as CircleSliceElement).cy;
    }
}
/** @end-author Roan Hofland */  