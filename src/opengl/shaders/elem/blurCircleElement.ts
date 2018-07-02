/** @author Roan Hofland */
import {CircleElement} from "./circleElement";

export interface BlurSliceElement extends CircleElement{
    cx?: number;
    cy?: number;
    alpha: number;
    blur: number;
}
/** @end-author Roan Hofland */