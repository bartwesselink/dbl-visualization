import {Visualizer} from '../interfaces/visualizer';
import {Node} from '../models/node';
import {OpenGL} from '../opengl/opengl';
import {Form} from '../form/form';
import {FormFactory} from '../form/form-factory';

/** @author Nico Klaassen */

export enum Orientation {
    HORIZONTAL,
    VERTICAL
}

export interface Bounds {
    left: number,
    right: number,
    bottom: number,
    top: number
}

export class SimpleTreeMap implements Visualizer {
    private gl: OpenGL;
    private colorA: number[];
    private colorB: number[];
    private colorDifference: number[];
    private totalNodes: number;
    private offset: number;

    constructor() {
        this.colorA = [255 / 255, 153 / 255, 0, 1];
        this.colorB = [51 / 255, 0, 255 / 255, 1];
        this.colorDifference = [
            this.colorB[0] - this.colorA[0],
            this.colorB[1] - this.colorA[1],
            this.colorB[2] - this.colorA[2],
            this.colorB[3] - this.colorA[3]
        ];
        this.offset = 2;
    }

    public draw(tree: Node, gl: OpenGL): void {
        // Call the recursive draw method
        this.gl = gl;

        // Initial bounds
        const bounds = {
            left: -300,
            right: 300,
            bottom: -300,
            top: 300
        };
        this.totalNodes = tree.subTreeSize;

        this.drawTree(tree, bounds, Orientation.HORIZONTAL, false, this.colorB);
    }

    /** drawTree draw the tree-map recursively.
     * @param {Node} tree The root of the subtree upon which we recurse
     * @param {Bounds} bounds The bounding-box indicating where we should draw the current root
     * @param {Orientation} orientation In which direction this node is oriented which indicates how children should be oriented
     * @param {boolean} internalNode Whether we are recursing on internal nodes, or on the root of the initial input tree
     * @param {number[]} color The color with which we should draw our current bounding-box based rectangle
     */
    private drawTree(tree: Node, bounds: Bounds, orientation: Orientation, internalNode: boolean, color: number[]): void {
        let doneSize = 0; // How many subtree-nodes are already taking up space within the bounds.

        let width = Math.abs(bounds.right - bounds.left);
        let height = Math.abs(bounds.top - bounds.bottom);

        // Draw the bounds of the current node
        this.gl.fillLinedAAQuad(bounds.left, bounds.bottom, width, height, color, [0, 0, 0, 1]);

        // Toggle the orientation for direct children of the current node
        if (orientation === Orientation.HORIZONTAL) {
            var childOrientation = Orientation.VERTICAL;
        } else {
            var childOrientation = Orientation.HORIZONTAL;
        }

        // Compute color and size per child, recurse on each child with the new - and nested - bounds.
        for (let i = 0; i < tree.children.length; i++) {
            const childNode = tree.children[i];
            const childBounds = this.setBounds(bounds, doneSize, tree.subTreeSize, childNode.subTreeSize, orientation);
            doneSize = doneSize + childNode.subTreeSize; // Add the # of nodes in the subtree rooted at the childnode to doneSize.

            // Color the new node based on the ratio between 'total tree size' and 'subtree size'.
            const childColor = [
                this.colorA[0] + this.colorDifference[0] * (childNode.subTreeSize / this.totalNodes),
                this.colorA[1] + this.colorDifference[1] * (childNode.subTreeSize / this.totalNodes),
                this.colorA[2] + this.colorDifference[2] * (childNode.subTreeSize / this.totalNodes),
                this.colorA[3] + this.colorDifference[3] * (childNode.subTreeSize / this.totalNodes)
            ];

            this.drawTree(childNode, childBounds, childOrientation, true, childColor);
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
    private setBounds(parentBounds: Bounds, doneSize: number, parentSize: number, childSize: number, parentOrientation: Orientation): Bounds {
        const parentWidth = Math.abs(parentBounds.right - parentBounds.left);
        const parentHeight = Math.abs(parentBounds.top - parentBounds.bottom);

        // Compute the new bounds which are nested within the bounds of the parent
        if (parentOrientation === Orientation.HORIZONTAL) {
            return {
                left: parentBounds.left + parentWidth * doneSize / parentSize,
                right: parentBounds.left + parentWidth * doneSize / parentSize + parentWidth * childSize / parentSize,
                bottom: parentBounds.bottom,
                top: parentBounds.top
            };
        } else {
            return {
                left: parentBounds.left,
                right: parentBounds.right,
                bottom: parentBounds.top - parentHeight * (childSize + doneSize) / parentSize,
                top: parentBounds.top - parentHeight * doneSize / parentSize
            };
        }

    };

    /** @end-author Nico Klaassen */

    public getForm(formFactory: FormFactory): Form|null {
        return null; // TODO: implement form
    }

    public applySettings(settings: object): void {
        return; // TODO: implement form
    }

    public getName(): string {
        return 'Simple Tree Map';
    }
}
