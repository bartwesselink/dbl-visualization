/** @author Roan Hofland */
export interface Element{
    pos?: WebGLBuffer;
    color?: any;
    indices?: WebGLBuffer;
    mode: number;
    length: number;
    offset?: number;
    overlay?: Element;
}
/** @end-author Roan Hofland */