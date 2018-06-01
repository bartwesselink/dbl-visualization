/** @author Roan Hofland */
import {Element} from "../../element";

export interface CircleSliceElement extends Element{
    radius: number;
    cx: number;
    cy: number;
    start: number;
    end: number;
    lineColor?: Float32Array;
}
/** @end-author Roan Hofland */