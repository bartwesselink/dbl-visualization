import {Visualizer} from '../interfaces/visualizer';
import {Node} from '../models/node';
import {Form} from '../form/form';
import {FormFactory} from '../form/form-factory';
import {Draw} from '../interfaces/draw';
import {VisualizerInput} from '../interfaces/visualizer-input';
import {Palette} from "../models/palette";

/** @author Nico Klaassen */
export class SpaceReclaimingStack implements Visualizer {
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
        let treeHeight: number;
        let drawOutlines: boolean = settings.outline;

        let sortedNodes: any;

        drawOutlines = settings.outline;

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

        /** In-order tree walk to store the nodes in an array based on depth
         *
         * @param tree Root of the tree we wish to recurse upon
         */
        const recursiveDepthSort = (tree: Node): void => {
            sortedNodes[tree.depth].push(tree);
            for (let i = 0; i < tree.children.length; i++) {
                recursiveDepthSort(tree.children[i], depth + 1);
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
        const drawTree = (treeLeft: Node, treeCenter: Node, treeRight: Node, depth: number, depthIndex: number, depthTotal: number, selected: boolean = false): void => {
            let tmpWidth = 600 / depthTotal;
            const heightOffset = 30;
            let currentX = tmpWidth * depthIndex - 300;
            const currentY = 30 * depth + 2;

            // if (tree.selected) {
            //     selected = true;
            //
            //     if (!drawOutlines) {
            //         color = selectedColor;
            //     } else {
            //         lineColor = selectedColor;
            //     }
            // } else {
            //     lineColor = defaultLineColor;
            // }

            if (treeLeft.parent !== treeCenter.parent) {
                currentX += 2;
                tmpWidth -= 4;
            } else if (treeCenter.parent !== treeRight.parent) {
                currentX -= 2;
                tmpWidth -= 4;
            }

            // Draw the bounds of the current node
            if (drawOutlines) {
                draws.push({
                    type: 6 /** FillLinedAAQuad **/,
                    identifier: treeCenter.identifier,
                    options: {
                        x: currentX,
                        y: currentY,
                        width: tmpWidth,
                        height: heightOffset,
                        fillColor: [1, 0, 0, 1],
                        lineColor: lineColor
                    }
                });
            } else {
                draws.push({
                    type: 4 /** FillAAQuad **/,
                    identifier: treeCenter.identifier,
                    options: {
                        x: currentX,
                        y: currentY,
                        width: tmpWidth,
                        height: heightOffset,
                        color: [1, 0, 0, 1]
                    }
                });
            }
        };

        // Initialize the array to sort the nodes by depth
        treeHeight = originalTree.maxDepth;
        sortedNodes = [];
        for (let i = 0; i <= treeHeight; i++) {
            sortedNodes.push([]);
        }

        recursiveDepthSort(originalTree);

        let depth = 0;
        for (let i = 0; i < sortedNodes.length; i++) {
            let depthTotal = sortedNodes[i].length;
            for (let j = 0; j < depthTotal; j++) {
                if (j == 0) {
                    if (depthTotal > 1) {
                        drawTree(sortedNodes[i][j], sortedNodes[i][j], sortedNodes[i][j+1], depth, j, depthTotal);
                    } else {
                        drawTree(sortedNodes[i][j], sortedNodes[i][j], sortedNodes[i][j], depth, j, depthTotal);
                    }
                } else if (j == depthTotal - 1) {
                    drawTree(sortedNodes[i][j-1], sortedNodes[i][j], sortedNodes[i][j], depth, j, depthTotal);
                } else {
                    drawTree(sortedNodes[i][j-1], sortedNodes[i][j], sortedNodes[i][j+1], depth, j, depthTotal);
                }
            }
            depth += 1;
        }

        return draws;
    }

    public getForm(formFactory: FormFactory) {
        return formFactory.createFormBuilder()
            .addToggleField('outline', true, {label: 'Draw outlines'})
            .addSliderField('offset', 0, {label: 'Offset', min: 0, max: 25})
            // .addChoiceField('offsetType', 'relative', { label: 'Offset type', expanded: false, choices: { relative: 'relative', fixed: 'fixed' } })
            .getForm();
    }

    public getName(): string {
        return 'Fixed Area Stack';
    }

    public getThumbnailImage(): string | null {
        return '/assets/images/visualization-simple-tree-map.png';
    }
}
/** @end-author Nico Klaassen */
