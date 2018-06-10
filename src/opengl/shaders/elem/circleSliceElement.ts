/** @author Roan Hofland */
import {CircleElement} from "./circleElement";

export interface CircleSliceElement extends CircleElement{
    cx?: number;
    cy?: number;
    start: number;
    end: number;
}
/** @end-author Roan Hofland */