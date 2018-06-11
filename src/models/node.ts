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

    // Tree depth information for gradients and visualization calculation
    maxDepth?: number; // Maximum depth of the root to a leaf in the subtree that this nodes resides in
    depth?: number; // Depth of the node
}
