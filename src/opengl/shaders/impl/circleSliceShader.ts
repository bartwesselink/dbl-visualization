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

    public init(shader: Shader, gl: WebGLRenderingContext): void{
        super.init(shader, gl);
        this.startUniform = gl.getUniformLocation(this.shader, "start");
        this.endUniform = gl.getUniformLocation(this.shader, "end");
        this.attribPosition = gl.getAttribLocation(this.shader, "pos");
    }
    
    public preProcess(elem: Element, gl: WebGLRenderingContext, opengl: OpenGL): void {
        super.preProcess(elem, gl, opengl);
        var r = (opengl.getRotation() % 360.0) * Matrix.oneDeg;
        var a = 0;
        if(r > Math.PI){
            a = 2.0 * Math.PI;
        }else if(r < -Math.PI){
            a = -2.0 * Math.PI;
        }
        
        var s = ((elem as CircleSliceElement).start - r) + a;
        var e = ((elem as CircleSliceElement).end - r) + a;
        if(elem.x == 2100){
            //0 - 360 originally
            console.log("s=", (s / Matrix.oneDeg) + " e=" + (e / Matrix.oneDeg), " r=" + opengl.getRotation(), " a=" + (a / Matrix.oneDeg));
        }
        
        gl.uniform1f(this.startUniform, s);
        gl.uniform1f(this.endUniform, e);
    }
    
    public getElementX(elem: Element){
        return (elem as CircleSliceElement).cx == null ? elem.x : (elem as CircleSliceElement).cx;
    }
    
    public getElementY(elem: Element){
        return (elem as CircleSliceElement).cy == null ? elem.y : (elem as CircleSliceElement).cy;
    }
}
/** @end-author Roan Hofland */  