import {Visualizer} from '../interfaces/visualizer';
import {Node} from '../models/node';
import {Form} from '../form/form';
import {FormFactory} from '../form/form-factory';
import {Draw} from '../interfaces/draw';
import {VisualizerInput} from '../interfaces/visualizer-input';
import {Palette} from "../models/palette";
import {NodeSpaceReclaimingStack} from "../models/node-space-reclaiming-stack";

/** @author Nico Klaassen */
export class SpaceReclaimingStack implements Visualizer {
    public draw(input: VisualizerInput): Draw[] {
        const originalTree = input.tree as NodeSpaceReclaimingStack;
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
        let startPoints: any;
        let endPoints: any;

        drawOutlines = settings.outline;

        /**
         * Function which calculates the height of the given tree recursively
         *
         * @param {Node} tree Tree for which to calculate the height for
         * @param {number} currentHeight Initially should be 0, variable to track current height.
         * @returns {number} The height of the tree
         */
        const calculateTreeHeight = (tree: NodeSpaceReclaimingStack, currentHeight: number): number => {
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
        const recursiveDepthSort = (tree: NodeSpaceReclaimingStack): void => {
            sortedNodes[tree.depth].push(tree);
            for (let i = 0; i < tree.children.length; i++) {
                recursiveDepthSort(tree.children[i]);
            }
        };

        const simpleCompute = (tree:NodeSpaceReclaimingStack, index: number): void => {
            console.log(tree.parent);
            const topY = 300 - 15 * tree.depth;
            const bottomY = 300 - 15 * (tree.depth + 1);
            if (tree.parent) {
                if (tree.parent.children.length > 1) {
                    const width = Math.abs(tree.parent.bottomleft[0] - tree.parent.bottomright[0])
                    const offset = width / (tree.parent.children.length - 1 ) * 2 * 0.025; // 0.1 = 10%
                    console.log("index: ");
                    console.log(index);
                    if (index == 0) {
                        tree.topleft = tree.parent.bottomleft;
                        tree.topright = [tree.parent.bottomleft[0] + width / tree.parent.children.length, topY];
                        tree.bottomleft = [tree.topleft[0], bottomY];
                        tree.bottomright = [tree.topright[0] - offset, bottomY];

                    } else if (index < tree.parent.children.length - 1) {
                        tree.topleft = [tree.parent.bottomleft[0] + width / tree.parent.children.length * index, topY];
                        tree.topright = [tree.parent.bottomleft[0] + width / tree.parent.children.length * (index + 1), topY];
                        tree.bottomleft = [tree.topleft[0] + offset, bottomY];
                        tree.bottomright = [tree.topright[0] - offset, bottomY];

                    } else {
                        tree.topleft = [tree.parent.bottomleft[0] + width / tree.parent.children.length * index, tree.parent.bottomleft[1]];
                        tree.topright = [tree.parent.bottomright[0], tree.parent.bottomright[1]];
                        tree.bottomleft = [tree.topleft[0] + offset, bottomY];
                        tree.bottomright = [tree.topright[0], bottomY];
                    }
                } else { // Only child
                    tree.topleft = tree.parent.bottomleft;
                    tree.topright = tree.parent.bottomright;
                    tree.bottomleft = [tree.parent.bottomleft[0], bottomY];
                    tree.bottomright = [tree.parent.bottomright[0], bottomY];
                }
            } else { // Root case
                tree.topleft = [-300, topY];
                tree.topright = [300, topY];
                tree.bottomleft = [-300, bottomY];
                tree.bottomright = [300, bottomY];
            }

            for (let i = 0; i < tree.children.length; i++) {
                simpleCompute(tree.children[i], i);
            }
        };

        const drawByDepth = (): void => {
            // for (int i = 0; i < sortedNodes.length; i++) {
            //     let depthTotal = sortedNodes[i].length;
            //     for (let j = 0; j < depthTotal; j++) {
            //         if (j == 0) {
            //             if (depthTotal > 1) {
            //                 draw(sortedNodes[i][j], sortedNodes[i][j], sortedNodes[i][j+1], depth, j, depthTotal);
            //             } else {
            //                 drawTree(sortedNodes[i][j], sortedNodes[i][j], sortedNodes[i][j], depth, j, depthTotal);
            //             }
            //         } else if (j == depthTotal - 1) {
            //             drawTree(sortedNodes[i][j-1], sortedNodes[i][j], sortedNodes[i][j], depth, j, depthTotal);
            //         } else {
            //             drawTree(sortedNodes[i][j-1], sortedNodes[i][j], sortedNodes[i][j+1], depth, j, depthTotal);
            //         }
            //     }
            // }
        };

        const recursiveDraw = (tree: NodeSpaceReclaimingStack, selected: boolean = false): void => {
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

            // Draw the bounds of the current node
            draws.push({ type: 23 /** FillCustomQuad **/,
                         options: {x1: tree.bottomleft[0] , y1: tree.bottomleft[1],
                                   x2: tree.bottomright[0], y2: tree.bottomright[1],
                                   x3: tree.topright[0]   , y3: tree.topright[1],
                                   x4: tree.topleft[0]    , y4: tree.topleft[1],
                                   fillColor: [Math.random(), Math.random(), Math.random()]}});

            for (let i = 0; i < tree.children.length; i++) {
                recursiveDraw(tree.children[i], selected);
            }
        };

        // Initialize the arrays to sort and draw the nodes by depth
        treeHeight = originalTree.maxDepth;
        sortedNodes = [];
        startPoints = [];
        endPoints = [];
        for (let i = 0; i <= treeHeight; i++) {
            sortedNodes.push([]);
            startPoints.push([]);
            endPoints.push([]);
        }

        console.log("simpleCompute start");
        simpleCompute(originalTree, 0);
        console.log("recursiveDepthSort start");
        recursiveDepthSort(originalTree);
        console.log("recursiveDraw start");
        recursiveDraw(originalTree, false);
        console.log("done");

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
        return 'Space Reclaiming Stack';
    }

    public getThumbnailImage(): string | null {
        return '/assets/images/visualization-simple-tree-map.png';
    }
}
/** @end-author Nico Klaassen */
