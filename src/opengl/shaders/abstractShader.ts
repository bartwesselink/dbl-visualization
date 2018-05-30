/** @author Roan Hofland */
import {Shader} from "./shader";
import {Element} from "../element";
import {OpenGL} from "../opengl";

export interface ShaderBase{
    shader: WebGLProgram;
    attribPosition: number;

    init(shader: Shader, gl: WebGLRenderingContext): void;
    preProcess(elem: Element, gl: WebGLRenderingContext, opengl: OpenGL): void;
}
/** @end-author Roan Hofland */  