import {Visualizer} from '../interfaces/visualizer';
import {Bounds} from '../interfaces/bounds';
import {Node} from '../models/node';
import {NodeTreeMap} from '../models/node-tree-map';
import {FormFactory} from '../form/form-factory';
import {VisualizerInput} from '../interfaces/visualizer-input';
import {Draw} from '../interfaces/draw';

/** @author Nico Klaassen */

export class SimpleTreeMap implements Visualizer {
    public draw(input: VisualizerInput): Draw[] {
        const originalTree = input.tree;
        const draws: Draw[] = [];
        const settings: any = input.settings;

        // define variables
        const defaultSize = 600;
        let colorA: number[] = [255 / 255, 153 / 255, 0, 1];
        let colorB: number[] = [51 / 255, 0, 255 / 255, 1];
        let defaultLineColor: number[] = [0, 0, 0, 1];
        let lineColor: number[] = defaultLineColor;
        let selectedColor: number[] = [255 / 255, 100 / 255, 0, 1];
        let colorDifference: number[] = [
            colorB[0] - colorA[0],
            colorB[1] - colorA[1],
            colorB[2] - colorA[2],
            colorB[3] - colorA[3]
        ];
        let totalNodes: number;
        let offset: number = settings.offset;
        let tree: NodeTreeMap = originalTree as NodeTreeMap;
        let rootBounds: Bounds = {
            left: -(defaultSize / 2),
            right: (defaultSize / 2),
            bottom: -(defaultSize / 2),
            top: (defaultSize / 2)
        };
        let treeHeight: number;
        let drawOutlines: boolean = settings.outline;

        drawOutlines = settings.outline;

        // define used enums
        enum Orientation {
            HORIZONTAL,
            VERTICAL
        }

        // define functions

        /**
         * Function which augments the tree data structure and adds in an orientation.
         *
         * @param {Node} tree Tree for which to calculate the orientation of the nodes for
         */
        const orientTreeNodes = (tree: NodeTreeMap): void => {
            // Toggle the orientation for direct children of the current node
            if (tree.orientation === Orientation.HORIZONTAL) {
                var childOrientation = Orientation.VERTICAL;
            } else {
                var childOrientation = Orientation.HORIZONTAL;
            }

            for (let i = 0; i < tree.children.length; i++) {
                const childNode = tree.children[i];
                childNode.orientation = childOrientation;
                orientTreeNodes(childNode);
            }
        };

        /**
         * Function which calculates the height of the given tree recursively
         *
         * @param {Node} tree Tree for which to calculate the height for
         * @param {number} currentHeight Initially should be 0, variable to track current height.
         * @returns {number} The height of the tree
         */
        const calculateTreeHeight = (tree: Node, currentHeight: number): number => {
            let treeHeight = currentHeight;
            for (let i = 0; i < tree.children.length; i++) {
                if (treeHeight == 0) {
                    treeHeight = calculateTreeHeight(tree.children[i], currentHeight + 1);
                } else {
                    const newHeight = calculateTreeHeight(tree.children[i], currentHeight + 1);
                    if (newHeight > treeHeight) {
                        treeHeight = newHeight;
                    }
                }
            }
            return treeHeight;
        };

        /** setBounds calculates the new and nested bounding-box (bounds) for a particular child-node and stores it on the
         * node itself.
         *
         * @param {Node} tree The (sub)tree for which to calculate bounds
         * @param {Bounds} parentBounds The bounding-box of the parent node
         * @param {number} doneSize How many descendants of the parent node are already accounted for by other siblings.
         * @param {boolean} last Whether this is the last of the children
         * @param {number} index The index of the child within the array containing its siblings (on the parent node)
         * @returns {Bounds} New bounding-box with the correct position and offset such that it is nested within parentBounds
         */
        const setBounds = (tree: NodeTreeMap, parentBounds: Bounds, doneSize: number, last: boolean, index: number): Bounds => {
            const parentWidth = Math.abs(parentBounds.right - parentBounds.left);
            const parentHeight = Math.abs(parentBounds.top - parentBounds.bottom);
            const parentSize = tree.parent.subTreeSize - 1;
            const childSize = tree.subTreeSize;

            // Compute the new bounds which are nested within the bounds of the parent
            if (tree.parent.orientation === Orientation.HORIZONTAL) {
                const relativeOffset = Math.min(parentWidth / 100 * offset / (tree.parent.children.length + 1), parentHeight / 100 * offset / (tree.parent.children.length + 1));
                const freeSpace = parentWidth - (tree.parent.children.length + 1) * relativeOffset;
                return {
                    left: (index == 0) ?
                        parentBounds.left + relativeOffset :
                        parentBounds.left + relativeOffset * (index + 1) + (freeSpace * doneSize / parentSize),
                    right: (last) ?
                        parentBounds.left + relativeOffset * (index + 1) + freeSpace :
                        parentBounds.left + relativeOffset * (index + 1) + (freeSpace * (doneSize + childSize) / parentSize),
                    bottom: parentBounds.bottom + relativeOffset,
                    top: parentBounds.top - relativeOffset
                };
            } else {
                const relativeOffset = Math.min(parentWidth / 100 * offset / (tree.parent.children.length + 1), parentHeight / 100 * offset / (tree.parent.children.length + 1));
                const freeSpace = parentHeight - (tree.parent.children.length + 1) * relativeOffset;
                return {
                    left: parentBounds.left + relativeOffset,
                    right: parentBounds.right - relativeOffset,
                    bottom: (last) ?
                        parentBounds.top - relativeOffset * (index + 1) - freeSpace :
                        parentBounds.top - relativeOffset * (index + 1) - (freeSpace * (doneSize + childSize) / parentSize),
                    top: (index == 0) ?
                        parentBounds.top - relativeOffset :
                        parentBounds.top - relativeOffset * (index + 1) - (freeSpace * doneSize / parentSize)
                };
            }
        };


        /** drawTree draw the tree-map recursively.
         *
         * @param {Node} tree The root of the subtree upon which we recurse
         * @param {Bounds} bounds The bounding-box indicating where we should draw the current root
         * @param {boolean} internalNode Whether we are recursing on internal nodes, or on the root of the initial input tree
         * @param {number[]} color The color with which we should draw our current bounding-box based rectangle
         * @param {boolean} selected Whether one of its parent was selected
         */
        const drawTree = (tree: Node, bounds: Bounds, internalNode: boolean, color: number[], selected: boolean = false): void => {
            let doneSize = 0; // How many subtree-nodes are already taking up space within the bounds.

            if (tree.selected) {
                selected = true;

                if (!drawOutlines) {
                    color = selectedColor;
                } else {
                    lineColor = selectedColor;
                }
            } else {
                lineColor = defaultLineColor;
            }

            let width = Math.abs(bounds.right - bounds.left);
            let height = Math.abs(bounds.top - bounds.bottom);

            // Draw the bounds of the current node
            if (drawOutlines) {

                draws.push({ type: 6 /** FillLinedAAQuad **/, identifier: tree.identifier, options: { x: bounds.left, y: bounds.bottom, width: width, height: height, fillColor: color, lineColor: lineColor } });
            } else {
                draws.push({ type: 4 /** FillAAQuad **/, identifier: tree.identifier, options: { x: bounds.left, y: bounds.bottom, width: width, height: height, color: color }});
            }

            // Compute color and size per child, recurse on each child with the new - and nested - bounds.
            for (let i = 0; i < tree.children.length; i++) {
                const childNode = tree.children[i];
                const childBounds = setBounds(childNode, bounds, doneSize, (i == tree.children.length - 1), i);
                doneSize = doneSize + childNode.subTreeSize; // Add the # of nodes in the subtree rooted at the childnode to doneSize.

                // Color the new node based on the ratio between 'total tree size' and 'subtree size'.
                const childColor = [
                    colorA[0] + colorDifference[0] * (childNode.subTreeSize / totalNodes),
                    colorA[1] + colorDifference[1] * (childNode.subTreeSize / totalNodes),
                    colorA[2] + colorDifference[2] * (childNode.subTreeSize / totalNodes),
                    colorA[3] + colorDifference[3] * (childNode.subTreeSize / totalNodes)
                ];

                drawTree(childNode, childBounds, true, childColor, selected);
            }
        };

        totalNodes = originalTree.subTreeSize;

        // Initialize orientation only when it's not yet defined
        if (!tree.orientation) {
            tree.orientation = Orientation.HORIZONTAL;
            orientTreeNodes(tree);
        }

        drawTree(tree, rootBounds, false, colorB);

        return draws;
    }

    public getForm(formFactory: FormFactory) {
        return formFactory.createFormBuilder()
            .addToggleField('outline', true, {label: 'Draw outlines'})
            .addSliderField('offset', 0, {label: 'Offset', min: 0, max: 25})
            .getForm();
    }

    public getName(): string {
        return 'Simple Tree Map';
    }

    public getThumbnailImage(): string | null {
        return '/assets/images/visualization-simple-tree-map.png';
    }
}

/** @end-author Nico Klaassen */
