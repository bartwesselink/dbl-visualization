/** @author Roan Hofland */
import {ShaderBase} from "../abstractShader";
import {Shader} from "../shader";
import {Element} from "../../element";
import {OpenGL} from "../../opengl";
import {vertexSource} from "../vertex/copyVertexShader";
import {fragmentSource} from "../fragment/copyFragmentShader";

export class CopyShader implements ShaderBase{
    public shader: WebGLProgram;
    public attribPosition: number;
    public modelviewUniform: WebGLUniformLocation;
    private colorUniform: WebGLUniformLocation;

    public init(shader: Shader, gl: WebGLRenderingContext): void{
        this.shader = shader.initShader(vertexSource, fragmentSource);
        this.modelviewUniform = gl.getUniformLocation(this.shader, "modelviewMatrix");
        this.colorUniform = gl.getUniformLocation(this.shader, "color");
        this.attribPosition = gl.getAttribLocation(this.shader, "pos");
    }
    
    public preProcess(elem: Element, gl: WebGLRenderingContext, opengl: OpenGL): void {
        gl.uniform3fv(this.colorUniform, elem.color)
    }
}
/** @end-author Roan Hofland */  