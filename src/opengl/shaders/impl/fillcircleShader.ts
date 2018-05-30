/** @author Roan Hofland */
import {ShaderBase} from "../abstractShader";
import {fillcircleFragmentSource} from "../fragment/fillcircleFragmentShader";
import {circleVertexSource} from "../vertex/circleVertexShader";
import {Shader} from "../shader";
import {CircleElement} from "../elem/circleElement";
import {Element} from "../../element";
import {OpenGL} from "../../opengl";
import {Matrix} from "../../matrix";

export class FillCircleShader implements ShaderBase{
    public shader: WebGLProgram;
    public attribPosition: number;
    public modelviewUniform: WebGLUniformLocation;
    private centerXUniform: WebGLUniformLocation;
    private centerYUniform: WebGLUniformLocation;
    private radiusUniform: WebGLUniformLocation;

    public init(shader: Shader, gl: WebGLRenderingContext): void{
        this.shader = shader.initShader(circleVertexSource, fillcircleFragmentSource);
        this.modelviewUniform = gl.getUniformLocation(this.shader, "modelviewMatrix");
        this.centerXUniform = gl.getUniformLocation(this.shader, "cx");
        this.centerYUniform = gl.getUniformLocation(this.shader, "cy");
        this.radiusUniform = gl.getUniformLocation(this.shader, "radius");
        this.attribPosition = gl.getAttribLocation(this.shader, "pos");
    }
    
    public preProcess(elem: Element, gl: WebGLRenderingContext, opengl: OpenGL): void {
        var tx = elem.x + opengl.getDX() * opengl.HALFWIDTH;
        var ty = elem.y + opengl.getDY() * opengl.HALFHEIGHT;
        gl.uniform1f(this.centerXUniform, ((opengl.getRX() * tx - opengl.getRY() * ty) / opengl.HALFWIDTH) * opengl.getZoom());
        gl.uniform1f(this.centerYUniform, ((opengl.getRY() * tx + opengl.getRX() * ty) / opengl.HALFHEIGHT) * opengl.getZoom());
        gl.uniform1f(this.radiusUniform, (elem as CircleElement).radius * opengl.getZoom());
    }
}
/** @end-author Roan Hofland */  