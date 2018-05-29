/** @author Roan Hofland */
import {ShaderBase} from "../abstractShader";
import {fillcircleFragmentSource} from "../fragment/fillcircleFragmentShader";
import {circleVertexSource} from "../vertex/circleVertexShader";
import {Shader} from "../shader";
import {CircleElement} from "../elem/circleElement";

export class FillCircleShader implements ShaderBase{
    public shader: WebGLProgram;
    public attribPosition: number;
    private centerUniform: WebGLUniformLocation;
    private radiusUniform: WebGLUniformLocation;

    public init(shader: Shader, gl: WebGLRenderingContext): void{
        console.log("init fill circle shader");
        this.shader = shader.initShader(circleVertexSource, fillcircleFragmentSource);
        console.log("shader: " + this.shader);
        this.centerUniform = gl.getUniformLocation(this.shader, "center");
        this.radiusUniform = gl.getUniformLocation(this.shader, "radius");
        this.attribPosition = gl.getAttribLocation(this.shader, "pos");
        console.log("done1");
    }
    
    public preProcess(elem: Element, gl: WebGLRenderingContext): void {
        gl.uniform2fv(this.centerUniform, [elem.x, elem.y]);//TODO inefffiiiiiiciiiieeeenttttt
        gl.uniform1f(this.radiusUniform, (elem as CircleElement).radius)
    }
}
/** @end-author Roan Hofland */  