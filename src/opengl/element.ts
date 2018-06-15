/** @author Roan Hofland */
import { ShaderMode } from "./shaders/shaderMode";

export interface Element{
    pos?: WebGLBuffer;
    color?: Float32Array;
    indices?: WebGLBuffer;
    mode?: number;
    length: number;
    span?: number;
    rad?: number;
    x?: number;
    y?: number;
    offset?: number;
    overlay?: Element;
    shader?: ShaderMode;
    hidden?: boolean;
    id?: number;
}
/** @end-author Roan Hofland */