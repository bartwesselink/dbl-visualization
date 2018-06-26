/** @author Roan Hofland */
import {Shader} from "../shader";
import {Element} from "../../element";
import {OpenGL} from "../../opengl";
import * as vertexSource from "raw-loader!../vertex/directVertexShader.glsl";
import * as fragmentSource from "raw-loader!../fragment/gridFragmentShader.glsl";

export class GridShader{
    public shader: WebGLProgram;
    public attribPosition: number;
    public uniformDX: WebGLUniformLocation;
    public uniformDY: WebGLUniformLocation;

    public init(shader: Shader, gl: WebGLRenderingContext): void{
        this.shader = shader.initShader(vertexSource, fragmentSource);
        this.attribPosition = gl.getAttribLocation(this.shader, "pos");
        this.uniformDX = gl.getUniformLocation(this.shader, "dx");
        this.uniformDY = gl.getUniformLocation(this.shader, "dy");
    }
}
/** @end-author Roan Hofland */  