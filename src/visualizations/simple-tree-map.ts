import {Visualizer} from '../interfaces/visualizer';
import {Bounds} from '../interfaces/bounds';
import {Node} from '../models/node';
import {NodeTreeMap} from '../models/node-tree-map'
import {OpenGL} from '../opengl/opengl';
import {FormFactory} from '../form/form-factory';
import {Orientation} from '../enums/orientation';

/** @author Nico Klaassen */

export class SimpleTreeMap implements Visualizer {
    readonly defaultSize = 600;
    private gl: OpenGL;
    private colorA: number[];
    private colorB: number[];
    private colorDifference: number[];
    private totalNodes: number;
    private offset: number;
    private offsetType: string;
    private tree: NodeTreeMap;
    private rootBounds: Bounds;
    private treeHeight: number;
    private drawOutlines: boolean;
    private offsetScale: number;

    constructor() {
        this.colorA = [255 / 255, 153 / 255, 0, 1];
        this.colorB = [51 / 255, 0, 255 / 255, 1];
        this.colorDifference = [
            this.colorB[0] - this.colorA[0],
            this.colorB[1] - this.colorA[1],
            this.colorB[2] - this.colorA[2],
            this.colorB[3] - this.colorA[3]
        ];

        this.offset = 0;
        this.offsetType = 'relative';

        this.rootBounds = {
            left: -(this.defaultSize / 2),
            right: (this.defaultSize / 2),
            bottom: -(this.defaultSize / 2),
            top: (this.defaultSize / 2)
        };
        this.drawOutlines = true;
        this.offsetScale = 0;
    }

    public draw(tree: Node, gl: OpenGL): void {
        this.tree = this.augmentTree(tree);
        this.gl = gl;

        this.totalNodes = tree.subTreeSize;
        this.treeHeight = this.calculateTreeHeight(tree, 0);

        // Initialize orientation
        this.tree.orientation = Orientation.HORIZONTAL;
        this.orientTreeNodes(tree);

        this.drawTree(tree, this.rootBounds, false, this.colorB);
    }

    /**
     * Augments the tree from the bottom up.
     *
     * @param {Node} tree
     * @param {NodeTreeMap} parent : optional
     * @returns {NodeTreeMap}
     */
    private augmentTree(tree: Node, parent?: NodeTreeMap): NodeTreeMap {
        let augmentedTree = {
            label: tree.label,
            children: [],
            subTreeSize: tree.subTreeSize,
            parent: parent
        };

        for (let i = 0; i < tree.children.length; i++) {
            augmentedTree.children.push(this.augmentTree(tree.children[i], augmentedTree));
        }

        return augmentedTree;
    }

    /** drawTree draw the tree-map recursively.
     *
     * @param {Node} tree The root of the subtree upon which we recurse
     * @param {Bounds} bounds The bounding-box indicating where we should draw the current root
     * @param {boolean} internalNode Whether we are recursing on internal nodes, or on the root of the initial input tree
     * @param {number[]} color The color with which we should draw our current bounding-box based rectangle
     */
    private drawTree(tree: Node, bounds: Bounds, internalNode: boolean, color: number[]): void {
        let doneSize = 0; // How many subtree-nodes are already taking up space within the bounds.

        let width = Math.abs(bounds.right - bounds.left);
        let height = Math.abs(bounds.top - bounds.bottom);

        // Draw the bounds of the current node
        if (this.drawOutlines) {
            this.gl.fillLinedAAQuad(bounds.left, bounds.bottom, width, height, color, [0, 0, 0, 1]);
        } else {
            this.gl.fillAAQuad(bounds.left, bounds.bottom, width, height, color);
        }

        // Compute color and size per child, recurse on each child with the new - and nested - bounds.
        for (let i = 0; i < tree.children.length; i++) {
            const childNode = tree.children[i];
            const childBounds = this.setBounds(childNode, bounds, doneSize, (i == tree.children.length - 1), i);
            doneSize = doneSize + childNode.subTreeSize; // Add the # of nodes in the subtree rooted at the childnode to doneSize.

            // Color the new node based on the ratio between 'total tree size' and 'subtree size'.
            const childColor = [
                this.colorA[0] + this.colorDifference[0] * (childNode.subTreeSize / this.totalNodes),
                this.colorA[1] + this.colorDifference[1] * (childNode.subTreeSize / this.totalNodes),
                this.colorA[2] + this.colorDifference[2] * (childNode.subTreeSize / this.totalNodes),
                this.colorA[3] + this.colorDifference[3] * (childNode.subTreeSize / this.totalNodes)
            ];

            this.drawTree(childNode, childBounds, true, childColor);
        }
    }

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
    private setBounds(tree: NodeTreeMap, parentBounds: Bounds, doneSize: number, last: boolean, index: number): Bounds {
        const parentWidth = Math.abs(parentBounds.right - parentBounds.left);
        const parentHeight = Math.abs(parentBounds.top - parentBounds.bottom);
        const parentSize = tree.parent.subTreeSize - 1;
        const childSize = tree.subTreeSize;

        // Compute the new bounds which are nested within the bounds of the parent
        if (tree.parent.orientation === Orientation.HORIZONTAL) {
            // if (this.offsetType == 'fixed') {
            //     const freeSpace = parentWidth - (tree.parent.children.length + 1) * this.offset;
            //     return {
            //         left: (index == 0) ?
            //             parentBounds.left + this.offset :
            //             parentBounds.left + this.offset * (index + 1) + (freeSpace * doneSize / parentSize),
            //         right: (last) ?
            //             parentBounds.left + this.offset * (index + 1) + freeSpace :
            //             parentBounds.left + this.offset * (index + 1) + (freeSpace * (doneSize + childSize) / parentSize),
            //         bottom: parentBounds.bottom + this.offset,
            //         top: parentBounds.top - this.offset
            //     };
            // } else { // this.offsetType == 'relative'
                const relativeOffset = Math.min(parentWidth / 100 * this.offset / (tree.parent.children.length + 1), parentHeight / 100 * this.offset / (tree.parent.children.length + 1));
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
            // }
        } else { // tree.parent.orientation === Orientation.VERTICAL
            // if (this.offsetType == 'fixed') {
            //     const freeSpace = parentHeight - (tree.parent.children.length + 1) * this.offset;
            //     return {
            //         left: parentBounds.left + this.offset,
            //         right: parentBounds.right - this.offset,
            //         bottom: (last) ?
            //             parentBounds.top - this.offset * (index + 1) - freeSpace :
            //             parentBounds.top - this.offset * (index + 1) - (freeSpace * (doneSize + childSize) / parentSize),
            //         top: (index == 0) ?
            //             parentBounds.top - this.offset :
            //             parentBounds.top - this.offset * (index + 1) - (freeSpace * doneSize / parentSize)
            //     };
            // } else { // this.offsetType == 'relative'
                const relativeOffset = Math.min(parentWidth / 100 * this.offset / (tree.parent.children.length + 1), parentHeight / 100 * this.offset / (tree.parent.children.length + 1));
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
            // }
        }
    };

    /**
     * Function which augments the tree data structure and adds in an orientation.
     *
     * @param {Node} tree Tree for which to calculate the orientation of the nodes for
     */
    private orientTreeNodes(tree: NodeTreeMap): void {
        // Toggle the orientation for direct children of the current node
        if (tree.orientation === Orientation.HORIZONTAL) {
            var childOrientation = Orientation.VERTICAL;
        } else {
            var childOrientation = Orientation.HORIZONTAL;
        }

        for (let i = 0; i < tree.children.length; i++) {
            const childNode = tree.children[i];
            childNode.orientation = childOrientation;
            this.orientTreeNodes(childNode);
        }
    }

    /**
     * Function which calculates the height of the given tree recursively
     *
     * @param {Node} tree Tree for which to calculate the height for
     * @param {number} currentHeight Initially should be 0, variable to track current height.
     * @returns {number} The height of the tree
     */
    private calculateTreeHeight(tree: Node, currentHeight: number): number {
        let treeHeight = currentHeight;
        for (let i = 0; i < tree.children.length; i++) {
            if (treeHeight == 0) {
                treeHeight = this.calculateTreeHeight(tree.children[i], currentHeight + 1);
            } else {
                const newHeight = this.calculateTreeHeight(tree.children[i], currentHeight + 1);
                if (newHeight > treeHeight) {
                    treeHeight = newHeight;
                }
            }
        }
        return treeHeight;
    }

    // /**
    //  * Recursive method to calculate the maximum width or height in terms of cell/segment count for a given tree.
    //  *
    //  * @param {Node} tree The tree for which to calculate the max segment width or height
    //  * @param {number} horizontalSegments Initial call should be 0 , parameter to track width recursively
    //  * @param {number} verticalSegments Initial call should be 0 , parameter to track height recursively
    //  * @returns {number} The maximum width or height in terms of cell / segment count
    //  */
    // private calculateMaxSegments(tree: NodeTreeMap, horizontalSegments: number, verticalSegments: number): number {
    //     let maxSegments = Math.max(horizontalSegments, verticalSegments);
    //
    //     for (let i = 0; i < tree.children.length; i++) {
    //         if (maxSegments == 0) {
    //             if (tree.orientation === Orientation.HORIZONTAL) {
    //                 maxSegments = this.calculateMaxSegments(tree.children[i], horizontalSegments + tree.children.length, verticalSegments + 1);
    //             } else {
    //                 maxSegments = this.calculateMaxSegments(tree.children[i], horizontalSegments + 1, verticalSegments + tree.children.length);
    //             }
    //         } else {
    //             let newMax;
    //             if (tree.orientation === Orientation.HORIZONTAL) {
    //                 newMax = this.calculateMaxSegments(tree.children[i], horizontalSegments + tree.children.length, verticalSegments + 1);
    //             } else {
    //                 newMax = this.calculateMaxSegments(tree.children[i], horizontalSegments + 1, verticalSegments + tree.children.length);
    //             }
    //
    //             if (newMax > maxSegments) {
    //                 maxSegments = newMax;
    //             }
    //
    //         }
    //     }
    //     return maxSegments;
    // }

    public getForm(formFactory: FormFactory) {
        return formFactory.createFormBuilder()
            .addToggleField('outline', true, {label: 'Draw outlines'})
            .addSliderField('offset', 0, {label: 'Offset', min: 0, max: 25})
            // .addChoiceField('offsetType', 'relative', { label: 'Offset type', expanded: false, choices: { relative: 'relative', fixed: 'fixed' } })
            .getForm();
    }

    public applySettings(settings: any) {
        this.drawOutlines = settings.outline;

        this.offset = settings.offset;
        this.offsetType = settings.offsetType;

        // if (this.offsetType == 'fixed') {
        //     // We have to create space to allow for the absolute offset of each cell
        //     // Using this currently enables the best implementation for offset in all
        //     // my extensive attempts thus far.
        //     if (this.offset > 0) {
        //         const oldBounds = this.rootBounds;
        //         this.updateRootBounds();
        //         const scaleFactor = (oldBounds.right / this.rootBounds.right); // Calculate a scalingfactor to prevent the visualization from moving
        //         this.gl.scale(scaleFactor); // Actually scale
        //         this.offsetScale = (300 / this.rootBounds.right); // Factor indicating how far away we are from normal scaling
        //         this.offset = Math.pow(this.offset, 1.4); // Increase scaling factor for the offset, this can be tweaked, though 1.4 works well for now
        //     }
        // } else { // this.offsetType == 'relative'
        //     const oldBounds = this.rootBounds;
        //     // Reset root bounds when we select to apply our offset as 'relative'
        //     this.rootBounds = {
        //         left: -(this.defaultSize / 2),
        //         right: (this.defaultSize / 2),
        //         bottom: -(this.defaultSize / 2),
        //         top: (this.defaultSize / 2),
        //     };
        //     const scaleFactor = (oldBounds.right / this.rootBounds.right); // Calculate a scalingfactor to prevent the visualization from moving
        //     this.gl.scale(scaleFactor); // Actually scale
        //     this.offsetScale = (300 / this.rootBounds.right); // Factor indicating how far away we are from normal scaling
        //     this.offset = Math.pow(this.offset, 1.4); // Increase scaling factor for the offset, this can be tweaked, though 1.4 works well for now
        // }

        this.gl.releaseBuffers();       // remove old data from buffers
        this.draw(this.tree, this.gl);  // fill buffers with new data
        this.gl.render();               // force a render
    }

    // /**
    //  * Utility function to calculate the new size for the upscaled base-square of the visualization
    //  */
    // public updateRootBounds(): void {
    //     // Caluclate how much offset we need at most based on width/height segment count.
    //     const maxSegments = this.calculateMaxSegments(this.tree, 0, 0);
    //
    //     this.rootBounds = {
    //         left: -(this.defaultSize / 2) - this.offset * this.treeHeight * maxSegments,
    //         right: (this.defaultSize / 2) + this.offset * this.treeHeight * maxSegments,
    //         bottom: -(this.defaultSize / 2) - this.offset * this.treeHeight * maxSegments,
    //         top: (this.defaultSize / 2) + this.offset * this.treeHeight * maxSegments
    //     };
    // }

    public getName(): string {
        return 'Simple Tree Map';
    }

    public getThumbnailImage(): string | null {
        return '/assets/images/visualization-simple-tree-map.png';
    }
}

/** @end-author Nico Klaassen */
