export interface Node {
    label: string;
    length?: number;
    children: Node[];
    identifier: number;
    parent?: Node;
    subTreeSize?: number;

    selected?: boolean;
    selectedNode?: Node; // reference in the root node, such that is shared over all windows and selection can easily be undone

    // these are only present in tree-navigator
    original?: Node;
    expandable?: boolean;
    forceExpand?: boolean;
}
