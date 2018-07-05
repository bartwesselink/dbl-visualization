import {Visualizer} from '../interfaces/visualizer';
import {Bounds} from '../interfaces/bounds';
import {Node} from '../models/node';
import {NodeTreeMap} from '../models/node-tree-map';
import {FormFactory} from '../form/form-factory';
import {VisualizerInput} from '../interfaces/visualizer-input';
import {Draw} from '../interfaces/draw';
import {Palette} from "../models/palette";
import { OpenGL } from "../opengl/opengl";

/** @author Nico Klaassen */

export class SimpleTreeMap implements Visualizer {
    public requireAntiAliasing: boolean = true;
    public shapesPerNode: number = 1;

    public draw(input: VisualizerInput): Draw[] {
        const originalTree = input.tree;
        const draws: Draw[] = [];
        const settings: any = input.settings;


        // define variables
        const defaultSize = 600;
        let offset: number = settings.offset;
        let tree: NodeTreeMap = originalTree as NodeTreeMap;
        let rootBounds: Bounds = {
            left: -(defaultSize / 2),
            right: (defaultSize / 2),
            bottom: -(defaultSize / 2),
            top: (defaultSize / 2)
        };
        let drawOutlines: boolean = settings.outline;

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
            for (let child of tree.children) {
                if (tree.orientation === Orientation.HORIZONTAL) {
                    child.orientation = Orientation.VERTICAL;
                } else {
                    child.orientation = Orientation.HORIZONTAL;
                }
                orientTreeNodes(child);
            }
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
            // Compute the new bounds which are nested within the bounds of the parent
            if (tree.parent.orientation === Orientation.HORIZONTAL) {
                const relativeOffset = Math.min(tree.parent.width / 100 * offset / (tree.parent.children.length + 1), tree.parent.height / 100 * offset / (tree.parent.children.length + 1));
                const freeSpace = tree.parent.width - (tree.parent.children.length + 1) * relativeOffset;
                return {
                    left: (index == 0) ?
                        parentBounds.left + relativeOffset :
                        parentBounds.left + relativeOffset * (index + 1) + (freeSpace * doneSize / (tree.parent.subTreeSize - 1)),
                    right: (last) ?
                        parentBounds.left + relativeOffset * (index + 1) + freeSpace :
                        parentBounds.left + relativeOffset * (index + 1) + (freeSpace * (doneSize + tree.subTreeSize) / (tree.parent.subTreeSize - 1)),
                    bottom: parentBounds.bottom + relativeOffset,
                    top: parentBounds.top - relativeOffset
                };
            } else {
                const relativeOffset = Math.min(tree.parent.width / 100 * offset / (tree.parent.children.length + 1), tree.parent.height / 100 * offset / (tree.parent.children.length + 1));
                const freeSpace = tree.parent.height - (tree.parent.children.length + 1) * relativeOffset;
                return {
                    left: parentBounds.left + relativeOffset,
                    right: parentBounds.right - relativeOffset,
                    bottom: (last) ?
                        parentBounds.top - relativeOffset * (index + 1) - freeSpace :
                        parentBounds.top - relativeOffset * (index + 1) - (freeSpace * (doneSize + tree.subTreeSize) / (tree.parent.subTreeSize - 1)),
                    top: (index == 0) ?
                        parentBounds.top - relativeOffset :
                        parentBounds.top - relativeOffset * (index + 1) - (freeSpace * doneSize / (tree.parent.subTreeSize - 1))
                };
            }
        };


        /** drawTree draw the tree-map recursively.
         *
         * @param {NodeTreeMap} tree The root of the subtree upon which we recurse
         * @param {Bounds} bounds The bounding-box indicating where we should draw the current root
         * @param {boolean} internalNode Whether we are recursing on internal nodes, or on the root of the initial input tree
         * @param {number[]} color The color with which we should draw our current bounding-box based rectangle
         * @param {boolean} selected Whether one of its parent was selected
         */
        const drawTree = (tree: NodeTreeMap, bounds: Bounds, internalNode: boolean, selected: boolean = false): void => {
            let doneSize = 0; // How many subtree-nodes are already taking up space within the bounds.

            let width = Math.abs(bounds.right - bounds.left);
            let height = Math.abs(bounds.top - bounds.bottom);

            // Draw the bounds of the current node
            if (drawOutlines) {
                draws.push({
                    type: 6 /** FillLinedAAQuad **/,
                    identifier: tree.identifier,
                    options: {
                        x: bounds.left,
                        y: bounds.bottom,
                        width: width,
                        height: height,
                    }
                });
            } else {
                draws.push({
                    type: 4 /** FillAAQuad **/,
                    identifier: tree.identifier,
                    options: {x: bounds.left, y: bounds.bottom, width: width, height: height}
                });
            }

            // Compute color and size per child, recurse on each child with the new - and nested - bounds.
            for (let i = 0; i < tree.children.length; i++) {
                const childNode = tree.children[i];
                const childBounds = setBounds(childNode, bounds, doneSize, (i == tree.children.length - 1), i);
                childNode.width = Math.abs(childBounds.right - childBounds.left);
                childNode.height = Math.abs(childBounds.top - childBounds.bottom);
                doneSize = doneSize + childNode.subTreeSize; // Add the # of nodes in the subtree rooted at the childnode to doneSize.

                drawTree(childNode, childBounds, true, selected);
            }
        };

        // Initialize orientation only when it's not yet defined
        if (!tree.orientation) {
            tree.orientation = Orientation.HORIZONTAL;
            orientTreeNodes(tree);
        }
        // Give the default width and height
        tree.width = defaultSize;
        tree.height = defaultSize;

        drawTree(tree, rootBounds, false);

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
        return 'assets/images/visualization-simple-tree-map.png';
    }

    public enableShaders(gl: OpenGL): void {
        gl.setSizeThresHold(5);
    }
    /** @end-author Nico Klaassen */
    /** @author Roan Hofland */
    public updateColors(gl: OpenGL, input: VisualizerInput, draws: Draw[]): void{
        this.recolor(input.tree, input.palette, input.settings.outline, gl, draws, input.tree.selected);
    }

    private recolor(tree: Node, palette: Palette, outline: boolean, gl: OpenGL, draws: Draw[], selected: boolean){
        if (selected || tree.selected) {
            selected = true;
            gl.setColor(draws[tree.identifier].glid, palette.gradientColorMapSelected[tree.maxDepth][tree.depth]);
            if(outline){
                gl.setLineColor(draws[tree.identifier].glid, [0, 0, 0, 1]);
            }
        } else {
            gl.setColor(draws[tree.identifier].glid, palette.gradientColorMap[tree.maxDepth][tree.depth]);
            if(outline){
                gl.setLineColor(draws[tree.identifier].glid, [0.3, 0.3, 0.3, 1]);
            }
        }
        for(let child of tree.children){
            this.recolor(child, palette, outline, gl, draws, selected);
        }
    }
    /** @end-author Roan Hofland */
}
