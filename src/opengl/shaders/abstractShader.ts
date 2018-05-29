/** @author Roan Hofland */
import {Shader} from "./shader";

export interface ShaderBase{
    shader: WebGLProgram;
    attribPosition: number;

    init(shader: Shader, gl: WebGLRenderingContext): void;
    preProcess(elem: Element, gl: WebGLRenderingContext): void;
}
/** @end-author Roan Hofland */  