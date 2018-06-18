/** @author Roan Hofland */
import {Shader} from "../shader";
import {Element} from "../../element";
import {OpenGL} from "../../opengl";
import * as vertexSource from "raw-loader!../vertex/directVertexShader.glsl";
import * as fragmentSource from "raw-loader!../fragment/gridFragmentShader.glsl";

export class GridShader{
    public shader: WebGLProgram;
    public attribPosition: number;

    public init(shader: Shader, gl: WebGLRenderingContext): void{
        this.shader = shader.initShader(vertexSource, fragmentSource);
        this.attribPosition = gl.getAttribLocation(this.shader, "pos");
    }
}
/** @end-author Roan Hofland */  