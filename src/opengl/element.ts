/** @author Roan Hofland */
export interface Element{
    pos?: WebGLBuffer;
    color?: number;
    indices?: WebGLBuffer;
    mode: number;
    length: number;
    span?: number;
    size?: number;
    x?: number;
    y?: number;
    offset?: number;
    overlay?: Element;
}
/** @end-author Roan Hofland */