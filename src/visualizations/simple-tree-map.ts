import {Visualizer} from '../interfaces/visualizer';
import {Bounds} from '../interfaces/bounds';
import {Node} from '../models/node';
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
    private tree: Node;
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
        this.tree = tree;
        this.gl = gl;

        this.totalNodes = tree.subTreeSize;
        this.treeHeight = this.calculateTreeHeight(tree, 0);

        // Initialize orientation
        tree.orientation = Orientation.HORIZONTAL;
        this.orientTreeNodes(tree);

        this.drawTree(tree, this.rootBounds, false, this.colorB);
    }

    /** drawTree draw the tree-map recursively.
     * @param {Node} tree The root of the subtree upon which we recurse
     * @param {Bounds} bounds The bounding-box indicating where we should draw the current root
     * @param {Orientation} orientation In which direction this node is oriented which indicates how children should be oriented
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

    /** setBounds calculates the new and nested bounding-box (bounds) for a particular child-node in relation to the
     * bounds of its parent.
     * @param {Bounds} parentBounds The bounding-box of the parent node
     * @param {number} doneSize How many descendants of the parent node are already accounted for by other siblings.
     * @param {number} parentSize How many descendants the parent node has
     * @param {number} childSize How many nodes there are in the subtree rooted at the node for which we calculate
     * @param {Orientation} parentOrientation The direction in which the parent has been laid out
     * @returns {Bounds} New bounding-box with the correct position and offset such that it is nested within parentBounds
     */
    private setBounds(tree: Node, parentBounds: Bounds, doneSize: number, last: boolean, index: number): Bounds {
        const parentWidth = Math.abs(parentBounds.right - parentBounds.left);
        const parentHeight = Math.abs(parentBounds.top - parentBounds.bottom);
        const parentSize = tree.parent.subTreeSize;
        const childSize = tree.subTreeSize;

        // Compute the new bounds which are nested within the bounds of the parent
        if (tree.parent.orientation === Orientation.HORIZONTAL) {
            // const offsetCompensation = (index + 1) * (parentWidth - parentWidth * (tree.parent.children.length + 1) * this.offset / tree.parent.children.length);
            const offsetCompensation = (parentWidth - this.offset * tree.parent.children.length) / tree.parent.children.length;
            console.log("comp: " + offsetCompensation);
            return {
                left: (index == 0) ?
                    parentBounds.left + this.offset :
                    parentBounds.left + parentWidth * doneSize / parentSize + this.offset * (index + 1) - offsetCompensation * (index + 1),
                right: (last) ?
                    parentBounds.left + parentWidth * doneSize / parentSize + parentWidth * childSize / parentSize + this.offset * (index + 1) - offsetCompensation * (index + 1) :
                    parentBounds.left + parentWidth * doneSize / parentSize + this.offset * (index + 1) - offsetCompensation * (index + 1),
                bottom: parentBounds.bottom + this.offset,
                top: parentBounds.top - this.offset
            };
        } else {
            return {
                left: parentBounds.left + this.offset,
                right: parentBounds.right - this.offset,
                bottom: last ?
                    parentBounds.top - parentHeight * doneSize / parentSize - parentHeight * childSize / parentSize + this.offset :
                    parentBounds.top - parentHeight * doneSize / parentSize - parentHeight * childSize / parentSize + this.offset / 2,
                top: parentBounds.top - parentHeight * doneSize / parentSize - this.offset / 2
            };
        //     return {
        //         left: parentBounds.left + parentWidth * doneSize / parentSize + this.offset / 2,
        //         right: last ? parentBounds.left + parentWidth * doneSize / parentSize + parentWidth * childSize / parentSize - this.offset : parentBounds.left + parentWidth * doneSize / parentSize + parentWidth * childSize / parentSize - this.offset / 2,
        //         bottom: parentBounds.bottom + this.offset,
        //         top: parentBounds.top - this.offset
        //     };
        // } else {
        //     return {
        //         left: parentBounds.left + this.offset,
        //         right: parentBounds.right - this.offset,
        //         bottom: last ? parentBounds.top - parentHeight * doneSize / parentSize - parentHeight * childSize / parentSize + this.offset : parentBounds.top - parentHeight * doneSize / parentSize - parentHeight * childSize / parentSize + this.offset / 2,
        //         top: parentBounds.top - parentHeight * doneSize / parentSize - this.offset / 2
        //     };
        }

    };

    private orientTreeNodes(tree: Node): void{
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

    private calculateMaxSegments(tree: Node, horizontalSegments: number, verticalSegments: number): number {
        let maxSegments = Math.max(horizontalSegments, verticalSegments);

        for (let i = 0; i < tree.children.length; i++) {
            if (maxSegments == 0) {
                if (tree.orientation === Orientation.HORIZONTAL) {
                    maxSegments = this.calculateMaxSegments(tree.children[i], horizontalSegments + tree.children.length, verticalSegments + 1);
                } else {
                    maxSegments = this.calculateMaxSegments(tree.children[i], horizontalSegments + 1, verticalSegments + tree.children.length);
                }
            } else {
                let newMax;
                if (tree.orientation === Orientation.HORIZONTAL) {
                    newMax = this.calculateMaxSegments(tree.children[i], horizontalSegments + tree.children.length, verticalSegments + 1);
                } else {
                    newMax = this.calculateMaxSegments(tree.children[i], horizontalSegments + 1, verticalSegments + tree.children.length);
                }

                if (newMax > maxSegments) {
                    maxSegments = newMax;
                }

            }
        }
        return maxSegments;
    }

    public getForm(formFactory: FormFactory) {
        return formFactory.createFormBuilder()
            .addToggleField('outline', true, {label: 'Draw outlines'})
            .addSliderField('offset', 0, {label: 'Offset', min: 0, max: 25})
            .getForm();
    }

    public applySettings(settings: any) {
        this.drawOutlines = settings.outline;
        this.offset = settings.offset;
        if (this.offset > 0) {
            const oldBounds = this.rootBounds;
            this.updateRootBounds();
            const scaleFactor = (oldBounds.right / this.rootBounds.right);
            console.log("scalefactor: " + scaleFactor);
            this.gl.scale(scaleFactor);
            this.offsetScale = (300 / this.rootBounds.right);
            this.offset *= 1;
            console.log("offset scale: " + this.offsetScale);
        }

        this.gl.releaseBuffers();       // remove old data from buffers
        this.draw(this.tree, this.gl);  // fill buffers with new data
        this.gl.render();               // force a render
    }

    public updateRootBounds(): void {
        const maxSegments = this.calculateMaxSegments(this.tree, 0, 0);

        this.rootBounds = {
            left: -(this.defaultSize / 2) - this.offset * this.treeHeight * maxSegments,
            right: (this.defaultSize / 2) + this.offset * this.treeHeight * maxSegments,
            bottom: -(this.defaultSize / 2) - this.offset * this.treeHeight * maxSegments,
            top: (this.defaultSize / 2) + this.offset * this.treeHeight * maxSegments
        };
    }

    public getName(): string {
        return 'Simple Tree Map';
    }

    public getThumbnailImage(): string | null {
        return null;
    }
}

/** @end-author Nico Klaassen */
