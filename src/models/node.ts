export interface Node {
    label: string;
    children: Node[];
    parent?: Node;

    // these are only present in tree-navigator
    original?: Node;
    expandable?: boolean;
}