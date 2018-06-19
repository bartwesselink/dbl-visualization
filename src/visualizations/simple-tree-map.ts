import {Visualizer} from '../interfaces/visualizer';
import {Bounds} from '../interfaces/bounds';
import {Node} from '../models/node';
import {NodeTreeMap} from '../models/node-tree-map';
import {FormFactory} from '../form/form-factory';
import {VisualizerInput} from '../interfaces/visualizer-input';
import {Draw} from '../interfaces/draw';
import {Palette} from "../models/palette";
import {OpenGL} from "../opengl/opengl";

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

        /** drawTree draw the tree-map recursively.
         *
         * @param {NodeTreeMap} tree The root of the subtree upon which we recurse
         * @param {Bounds} bounds The bounding-box indicating where we should draw the current root
         * @param {boolean} internalNode Whether we are recursing on internal nodes, or on the root of the initial input tree
         * @param {boolean} selected Whether one of its parent was selected
         */
        const drawTree = (tree: NodeTreeMap, bounds: Bounds, internalNode: boolean): void => {
            let doneSize = 0; // How many subtree-nodes are already taking up space within the bounds.

            const relativeOffset = tree.orientation === Orientation.HORIZONTAL ?
                Math.min(tree.width / 100 * offset / (tree.children.length + 1), tree.height / 100 * offset / (tree.children.length + 1)) :
                Math.min(tree.width / 100 * offset / (tree.children.length + 1), tree.height / 100 * offset / (tree.children.length + 1));
            const freeSpace = tree.orientation === Orientation.HORIZONTAL ?
                tree.width - (tree.children.length + 1) * relativeOffset :
                tree.height - (tree.children.length + 1) * relativeOffset;

            // Draw the bounds of the current node
            if (tree.orientation === Orientation.HORIZONTAL) {
                if (drawOutlines) {
                    draws.push({
                        type: 6 /** FillLinedAAQuad **/,
                        identifier: tree.identifier,
                        options: {
                            x: bounds.left,
                            y: bounds.bottom,
                            width: tree.width,
                            height: tree.height
                        }
                    });
                } else {
                    draws.push({
                        type: 4 /** FillAAQuad **/,
                        identifier: tree.identifier,
                        options: {x: bounds.left, y: bounds.bottom, width: tree.width, height: tree.height}
                    });
                }
            } else { // (tree.orientation === Orientation.VERTICAL)
                if (drawOutlines) {
                    draws.push({
                        type: 6 /** FillLinedAAQuad **/,
                        identifier: tree.identifier,
                        options: {
                            x: bounds.left,
                            y: bounds.bottom,
                            width: tree.width,
                            height: tree.height
                        }
                    });
                } else {
                    draws.push({
                        type: 4 /** FillAAQuad **/,
                        identifier: tree.identifier,
                        options: {x: bounds.left, y: bounds.bottom, width: tree.width, height: tree.height}
                    });
                }
            }

            // Compute color and size per child, recurse on each child with the new - and nested - bounds.
            for (let i = 0; i < tree.children.length; i++) {
                const childNode = tree.children[i];
                const childBounds = tree.orientation === Orientation.HORIZONTAL ?
                    {
                        left: (i == 0) ?
                            bounds.left + relativeOffset :
                            bounds.left + relativeOffset * (i + 1) + (freeSpace * doneSize / (tree.subTreeSize - 1)),
                        right: (i == tree.children.length - 1) ?
                            bounds.left + relativeOffset * (i + 1) + freeSpace :
                            bounds.left + relativeOffset * (i + 1) + (freeSpace * (doneSize + childNode.subTreeSize) / (tree.subTreeSize - 1)),
                        bottom: bounds.bottom + relativeOffset,
                        top: bounds.top - relativeOffset
                    } :
                    {
                        left: bounds.left + relativeOffset,
                        right: bounds.right - relativeOffset,
                        bottom: (i == tree.children.length - 1) ?
                            bounds.top - relativeOffset * (i + 1) - freeSpace :
                            bounds.top - relativeOffset * (i + 1) - (freeSpace * (doneSize + childNode.subTreeSize) / (tree.subTreeSize - 1)),
                        top: (i == 0) ?
                            bounds.top - relativeOffset :
                            bounds.top - relativeOffset * (i + 1) - (freeSpace * doneSize / (tree.subTreeSize - 1))
                    };

                childNode.width = Math.abs(childBounds.right - childBounds.left);
                childNode.height = Math.abs(childBounds.top - childBounds.bottom);
                doneSize = doneSize + childNode.subTreeSize; // Add the # of nodes in the subtree rooted at the childnode to doneSize.

                drawTree(childNode, childBounds, true);
            }
        };

        // Initialize orientation only when it's not yet defined
        if (!tree.orientation) {
            tree.orientation = Orientation.HORIZONTAL;
            orientTreeNodes(tree);
        }

        tree.width = defaultSize;
        tree.height = defaultSize;

        drawTree(tree, rootBounds, false);

        return draws;
    }

    public getForm(formFactory: FormFactory) {
        return formFactory.createFormBuilder()
            .addToggleField('outline', true, {label: 'Draw outline for each node'})
            .addSliderField('offset', 0, {label: 'Padding for each node', min: 0, max: 25})
            .getForm();
    }

    public getName(): string {
        return 'Simple Tree Map';
    }

    public getThumbnailImage(): string | null {
        return '/assets/images/visualization-simple-tree-map.png';
    }

    public enableShaders(gl: OpenGL): void {
        gl.setSizeThresHold(5);
    }

    /**
     * Function which checks if no node is selected within the given tree.
     *
     * @param {Node} tree Tree to recurse upon
     */
    private hasSelected (tree: NodeTreeMap): boolean {
        let hasSomeSelectedNode = tree.selected;
        if (hasSomeSelectedNode) {
            return true;
        }

        for (let child of tree.children) {
            hasSomeSelectedNode = this.hasSelected(child);
            if (hasSomeSelectedNode) {
                return true;
            }
        }

        return false;
    };
    /** @end-author Nico Klaassen */
    /** @author Roan Hofland */
    public updateColors(gl: OpenGL, input: VisualizerInput, draws: Draw[]): void{
        this.recolor(input.tree, input.palette, input.settings.outline, gl, draws, input.tree.selected || !this.hasSelected(input.tree));
    }

    private recolor(tree: Node, palette: Palette, outline: boolean, gl: OpenGL, draws: Draw[], selected: boolean){
        if (selected || tree.selected) {
            selected = true;
            gl.setColor(draws[tree.identifier].glid, palette.gradientColorMapSelected[tree.maxDepth][tree.depth]);
            if(outline){
                gl.setLineColor(draws[tree.identifier].glid, [0, 0, 0]);
            }
        } else {
            gl.setColor(draws[tree.identifier].glid, palette.gradientColorMap[tree.maxDepth][tree.depth]);
            if(outline){
                gl.setLineColor(draws[tree.identifier].glid, [0.3, 0.3, 0.3]);
            }
        }
        for(let child of tree.children){
            this.recolor(child, palette, outline, gl, draws, selected);
        }
    }
    /** @end-author Roan Hofland */
}
