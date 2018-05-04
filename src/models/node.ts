export interface Node {
    label: string;
    children: Node[];
    parent?: Node;
    subTreeSize?: number;

    // these are only present in tree-navigator
    original?: Node;
    expandable?: boolean;
}