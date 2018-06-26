/** @author Roan Hofland */
import {Shader} from "../shader";
import {Element} from "../../element";
import {OpenGL} from "../../opengl";
import * as vertexSource from "raw-loader!../vertex/directVertexShader.glsl";
import * as fragmentSource from "raw-loader!../fragment/gridFragmentShader.glsl";

export class GridShader{
    public shader: WebGLProgram;
    public attribPosition: number;
    public dxUniform: WebGLUniformLocation;
    public dyUniform: WebGLUniformLocation;
    public rxUniform: WebGLUniformLocation;
    public ryUniform: WebGLUniformLocation;
    public factorUniform: WebGLUniformLocation;

    public init(shader: Shader, gl: WebGLRenderingContext): void{
        this.shader = shader.initShader(vertexSource, fragmentSource);
        this.attribPosition = gl.getAttribLocation(this.shader, "pos");
        this.dxUniform = gl.getUniformLocation(this.shader, "dx");
        this.dyUniform = gl.getUniformLocation(this.shader, "dy");
        this.rxUniform = gl.getUniformLocation(this.shader, "rx");
        this.ryUniform = gl.getUniformLocation(this.shader, "ry");
        this.factorUniform = gl.getUniformLocation(this.shader, "factor");
    }
}
/** @end-author Roan Hofland */  