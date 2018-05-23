import {Node} from "./node";
import {Orientation} from "../enums/orientation";

/** @author Nico Klaassen */

/**
 * Augmented tree structure which extends the Node interface
 * Used to support the simple (nested) tree map visualization
 */
export interface NodeTreeMap extends Node {
    children: NodeTreeMap[];
    parent?: NodeTreeMap;
    orientation?: Orientation;
}
/** @end-author Nico Klaassen */
