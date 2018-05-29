/** @author Roan Hofland */
export interface Element{
    pos?: WebGLBuffer;
    color?: Float32Array;
    indices?: WebGLBuffer;
    mode: number;
    length: number;
    span?: number;
    rad?: number;
    x?: number;
    y?: number;
    offset?: number;
    overlay?: Element;
}
/** @end-author Roan Hofland */