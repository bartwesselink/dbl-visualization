import {Orientation} from "../enums/orientation";

export interface Node {
    label: string;
    children: Node[];
    parent?: Node;
    subTreeSize?: number;

    // these are only present in tree-navigator
    original?: Node;
    expandable?: boolean;

    // these are only present in simple-tree-map
    orientation?: Orientation;
}
