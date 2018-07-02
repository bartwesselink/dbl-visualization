/** @author Roan Hofland */
import {CircleElement} from "./circleElement";

export interface BlurCircleElement extends CircleElement{
    alpha: number;
    blur: number;
    dx: number;
    dy: number;
}
/** @end-author Roan Hofland */