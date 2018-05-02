/** @author Roan Hofland */
export interface Element{
    pos: WebGLBuffer;
    color: WebGLBuffer;
    indices?: WebGLBuffer;
    mode: number;
    length: number;
    offset?: number;
}
/** @end-author Roan Hofland */