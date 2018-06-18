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

export class IciclePlot implements Visualizer {
    public requireAntiAliasing: boolean = true;
    public shapesPerNode: number = 1;

    public draw(input: VisualizerInput): Draw[] {
        const originalTree = input.tree;
        const draws: Draw[] = [];
        const settings: any = input.settings;
        let defaultWidth: number;
        let defaultHeight: number;

        // define variables
        let sizeCalculationMethod: string = settings.sizeCalculationMethod;
        let direction: string = settings.direction;
        if (direction === 'xPositive' || direction === 'xNegative') {
            defaultWidth = settings.height;
            defaultHeight = settings.width;
        } else {
            defaultWidth = settings.width;
            defaultHeight = settings.height;
        }
        let offset: number = settings.offset - 1; // I can not figure out why 0 already gives some slight offset, -1 fixes this.

        let tree: NodeTreeMap = originalTree;
        let heightOffset: number;
        let rootBounds: Bounds = {
            left: -(defaultWidth / 2),
            right: (defaultWidth / 2),
        };

        // define functions

        /**
         * Function which calculates the height of the given tree recursively
         *
         * @param {Node} tree Tree for which to calculate the height for
         * @param {number} currentHeight Initially should be 0, variable to track current height.
         * @returns {number} The height of the tree
         */
        const calculateTreeMaxDepth = (tree: Node, currentHeight: number): number => {
            let treeHeight = currentHeight;
            for (let child of tree.children) {
                if (treeHeight == 0) {
                    treeHeight = calculateTreeMaxDepth(child, currentHeight + 1);
                } else {
                    const newHeight = calculateTreeMaxDepth(child, currentHeight + 1);
                    if (newHeight > treeHeight) {
                        treeHeight = newHeight;
                    }
                }
            }
            return treeHeight;
        };

        const calculateChildBounds = (tree: Node, parentBounds: Bounds, index: number): Bounds => {
            if (sizeCalculationMethod === 'asChildCount') {
                return {
                    left: parentBounds.left + (Math.abs(parentBounds.right - parentBounds.left) / tree.children.length) * index,
                    right: parentBounds.left + (Math.abs(parentBounds.right - parentBounds.left) / tree.children.length) * (index + 1)
                }
            } else {// (sizeCalculationMethod === 'asSubtreeSize')
                let doneSize = 0;
                while (index >= 0) {
                    doneSize += tree.parent.children[index].subTreeSize;
                    index -= 1;
                }
                return {left: parentBounds.left + (Math.abs(parentBounds.right - parentBounds.left) * (doneSize - tree.subTreeSize) / (tree.parent.subTreeSize - 1)),
                    right: parentBounds.left + (Math.abs(parentBounds.right - parentBounds.left) * doneSize / (tree.parent.subTreeSize - 1))};
            }
        }

        /** drawTree draw the tree-map recursively.
         *
         * @param {NodeTreeMap} tree The root of the subtree upon which we recurse
         * @param {Bounds} bounds The bounding-box indicating where we should draw the current root
         * @param {boolean} internalNode Whether we are recursing on internal nodes, or on the root of the initial input tree
         * @param {number[]} color The color with which we should draw our current bounding-box based rectangle
         * @param {boolean} selected Whether one of its parent was selected
         */
        const drawTree = (tree: Node, bounds: Bounds, selected: boolean = false): void => {
            // Draw the bounds of the current node
            if (direction === 'xPositive') {
                const y = -1 * (defaultHeight / 2) + tree.depth * (heightOffset + 1);
                const width = Math.abs(bounds.right - bounds.left);
                draws.push({
                    type: 4 /** FillAAQuad **/,
                    identifier: tree.identifier,
                    options: {x: y, y: bounds.left, width: heightOffset - offset, height: width}
                });
            } else if (direction === 'xNegative') {
                const y = defaultHeight / 2 - tree.depth * (heightOffset + 1);
                const width = Math.abs(bounds.right - bounds.left);
                draws.push({
                    type: 4 /** FillAAQuad **/,
                    identifier: tree.identifier,
                    options: {x: y, y: bounds.left, width: heightOffset - offset, height: width}
                });
            } else if (direction === 'yPositive') {
                const y = -1 * (defaultHeight / 2) + tree.depth * (heightOffset + 1);
                const width = Math.abs(bounds.right - bounds.left);
                draws.push({
                    type: 4 /** FillAAQuad **/,
                    identifier: tree.identifier,
                    options: {x: bounds.left, y: y, width: width, height: heightOffset - offset}
                });
            } else { // (direction === 'yNegative')
                const y = defaultHeight / 2 - tree.depth * (heightOffset + 1);
                const width = Math.abs(bounds.right - bounds.left);
                draws.push({
                    type: 4 /** FillAAQuad **/,
                    identifier: tree.identifier,
                    options: {x: bounds.left, y: y, width: width, height: heightOffset - offset}
                });
            }
            // Compute color and size per child, recurse on each child with the new - and nested - bounds.
            for (let i = 0; i < tree.children.length; i++) {
                const childNode = tree.children[i];
                const childBounds = calculateChildBounds(childNode, bounds, i);

                drawTree(childNode, childBounds, selected);
            }
        };

        // Give the default width and height
        heightOffset = defaultHeight / (calculateTreeMaxDepth(tree, 0) - 1);
        drawTree(tree, rootBounds);

        return draws;
    }

    public getForm(formFactory: FormFactory) {
        return formFactory.createFormBuilder()
            .addNumberField('width', 600, {label: 'Plot width'})
            .addNumberField('height', 600, {label: 'Plot height'})
            .addSliderField('offset', 0, {label: 'Offset', min: 0, max: 10})
            .addChoiceField('direction', 'yNegative', {
                label: 'Direction of the plot',
                expanded: false,
                choices: {xPositive: 'x+', xNegative: 'x-', yPositive: 'y+', yNegative: 'y-'}
            })
            .addChoiceField('sizeCalculationMethod', 'asSubtreeSize', {
                label: 'How to determine node size',
                expanded: false,
                choices: {asChildCount: 'Child-count', asSubtreeSize: 'Subtree size'}
            })
            .getForm();
    }

    public getName(): string {
        return 'Icicle Plot';
    }

    public getThumbnailImage(): string | null {
        return '/assets/images/visualization-icicle-plot.png';
    }
    /** @end-author Nico Klaassen */
    /** @author Roan Hofland */
    public updateColors(gl: OpenGL, input: VisualizerInput, draws: Draw[]): void{
        this.recolor(input.tree, input.palette, gl, draws, input.tree.selected);
    }
    
    private recolor(tree: Node, palette: Palette, gl: OpenGL, draws: Draw[], selected: boolean){
        if (selected || tree.selected) {
            selected = true;
            gl.setColor(draws[tree.identifier].glid, palette.gradientColorMapSelected[tree.maxDepth][tree.depth]);
        } else {
            gl.setColor(draws[tree.identifier].glid, palette.gradientColorMap[tree.maxDepth][tree.depth]);
        }
        for(let child of tree.children){
            this.recolor(child, palette, gl, draws, selected);
        }
    }
    /** @end-author Roan Hofland */
}