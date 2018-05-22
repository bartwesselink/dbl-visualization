/** @author Roan Hofland */
export interface Element{
    pos?: WebGLBuffer;
    color?: number;
    indices?: WebGLBuffer;
    mode: number;
    length: number;
    size?: number;
    offset?: number;
    overlay?: Element;
}
/** @end-author Roan Hofland */