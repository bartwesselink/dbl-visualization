import {Node} from "./node";

/** @author Nico Klaassen */

/**
 * Augmented tree structure which extends the Node interface
 * Used to support the simple (nested) tree map visualization
 */
export interface NodeTreeMap extends Node {
    children: NodeTreeMap[];
    parent?: NodeTreeMap;
    orientation?: number; // actually it is Orientation, but this cannot be imported.
}
/** @end-author Nico Klaassen */
