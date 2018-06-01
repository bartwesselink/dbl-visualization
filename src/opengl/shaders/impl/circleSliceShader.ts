/** @author Roan Hofland */
import {ShaderBase} from "../abstractShader";
import {Shader} from "../shader";
import {CircleSliceElement} from "../elem/circleSliceElement";
import {Element} from "../../element";
import {OpenGL} from "../../opengl";

export abstract class CircleSliceShader implements ShaderBase{
    public shader: WebGLProgram;
    public attribPosition: number;
    public modelviewUniform: WebGLUniformLocation;
    private centerXUniform: WebGLUniformLocation;
    private centerYUniform: WebGLUniformLocation;
    private radiusUniform: WebGLUniformLocation;
    private startUniform: WebGLUniformLocation; 
    private endUniform: WebGLUniformLocation;

    public init(shader: Shader, gl: WebGLRenderingContext): void{
        this.shader = this.preInit(shader);
        this.modelviewUniform = gl.getUniformLocation(this.shader, "modelviewMatrix");
        this.centerXUniform = gl.getUniformLocation(this.shader, "cx");
        this.centerYUniform = gl.getUniformLocation(this.shader, "cy");
        this.radiusUniform = gl.getUniformLocation(this.shader, "radius");
        this.startUniform = gl.getUniformLocation(this.shader, "start");
        this.endUniform = gl.getUniformLocation(this.shader, "end");
        this.attribPosition = gl.getAttribLocation(this.shader, "pos");
        this.postInit(gl);
    }
    
    public preProcess(elem: Element, gl: WebGLRenderingContext, opengl: OpenGL): void {
        var tx = elem.x + opengl.getDX() * opengl.HALFWIDTH;
        var ty = elem.y + opengl.getDY() * opengl.HALFHEIGHT;
        gl.uniform1f(this.centerXUniform, ((opengl.getRX() * tx - opengl.getRY() * ty) / opengl.HALFWIDTH) * opengl.getZoom());
        gl.uniform1f(this.centerYUniform, ((opengl.getRY() * tx + opengl.getRX() * ty) / opengl.HALFHEIGHT) * opengl.getZoom());
        gl.uniform1f(this.radiusUniform, (elem as CircleSliceElement).radius * opengl.getZoom());
        gl.uniform1f(this.startUniform, (elem as CircleSliceElement).start);
        gl.uniform1f(this.endUniform, (elem as CircleSliceElement).end);
        this.postProcess(elem, gl);
    }
    
    abstract preInit(shader: Shader): WebGLProgram;
    
    abstract postInit(gl: WebGLRenderingContext): void;
    
    abstract postProcess(elem: Element, gl: WebGLRenderingContext): void;
}
/** @end-author Roan Hofland */  