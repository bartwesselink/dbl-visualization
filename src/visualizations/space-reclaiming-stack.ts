import {Visualizer} from '../interfaces/visualizer';
import {Node} from '../models/node';
import {Form} from '../form/form';
import {FormFactory} from '../form/form-factory';
import {Draw} from '../interfaces/draw';
import {VisualizerInput} from '../interfaces/visualizer-input';
import {Palette} from "../models/palette";
import {NodeSpaceReclaimingStack} from "../models/node-space-reclaiming-stack";
import {OpenGL} from "../opengl/opengl";

/** @author Nico Klaassen */
export class SpaceReclaimingStack implements Visualizer {
    shapesPerNode: number = 1;

    public draw(input: VisualizerInput): Draw[] {
        const originalTree = input.tree as NodeSpaceReclaimingStack;
        const draws: Draw[] = [];
        const settings: any = input.settings;

        // define variables
        let height = settings.height;
        let width = settings.width;
        let reclaimCoefficient = settings.reclaimCoefficient;
        const levelHeight = height / originalTree.maxDepth;

        let sortedNodes: any;
        let startPoints: any;
        let endPoints: any;


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

        const calculateIndex = (tree: NodeSpaceReclaimingStack): number => {
            for (let i = 0; i < tree.parent.children.length; i++) {
                if (tree.parent.children[i] === tree) {
                    return i;
                }
            }
            return -1;
        }

        const simpleCompute = (): void => {//tree:NodeSpaceReclaimingStack, index: number): void => {
            for (let depth = 0; depth < sortedNodes.length; depth++) {
                const offset = Math.min(width / sortedNodes[depth].length * 0.025, 4);
                const segmentWidth = (width - offset * (sortedNodes[depth].length - 1)) / sortedNodes[depth].length;
                let left = - width / 2;
                let right = left + segmentWidth;

                for (let i = 0; i < sortedNodes[depth].length; i++) {
                    const tree = sortedNodes[depth][i];
                    const topY = height / 2 - levelHeight * tree.depth;
                    const bottomY = height / 2 - levelHeight * (tree.depth + 1);

                    if (tree.parent) {
                        if (tree.parent.children.length > 1) {
                            const width = Math.abs(tree.parent.bottomleft[0] - tree.parent.bottomright[0]);
                            const index = calculateIndex(tree);

                            if (index == 0) {
                                tree.topleft = tree.parent.bottomleft;
                                tree.topright = [tree.parent.bottomleft[0] + width / tree.parent.children.length, topY];
                                tree.bottomleft = [left, bottomY];
                                tree.bottomright = [right, bottomY];

                            } else if (index < tree.parent.children.length - 1) {
                                tree.topleft = [tree.parent.bottomleft[0] + width / tree.parent.children.length * index, topY];
                                tree.topright = [tree.parent.bottomleft[0] + width / tree.parent.children.length * (index + 1), topY];
                                tree.bottomleft = [left, bottomY];
                                tree.bottomright = [right, bottomY];

                            } else {
                                tree.topleft = [tree.parent.bottomleft[0] + width / tree.parent.children.length * index, tree.parent.bottomleft[1]];
                                tree.topright = [tree.parent.bottomright[0], tree.parent.bottomright[1]];
                                tree.bottomleft = [left, bottomY];
                                tree.bottomright = [right, bottomY];
                            }
                        } else { // Only child
                            tree.topleft = tree.parent.bottomleft;
                            tree.topright = tree.parent.bottomright;
                            tree.bottomleft = [tree.parent.bottomleft[0], bottomY];
                            tree.bottomright = [tree.parent.bottomright[0], bottomY];
                        }
                    } else { // Root case
                        tree.topleft = [-width / 2, topY];
                        tree.topright = [width / 2, topY];
                        tree.bottomleft = [- width / 2, bottomY];
                        tree.bottomright = [width / 2, bottomY];
                    }

                    left += segmentWidth + offset;
                    right += segmentWidth + offset;
                }
            }
        };

        const recursiveDraw = (tree: NodeSpaceReclaimingStack, selected: boolean = false): void => {
            // Draw the bounds of the current node
            draws.push({ type: 23 /** FillCustomQuad **/,
                         identifier: tree.identifier,
                         options: {x1: tree.bottomleft[0] , y1: tree.bottomleft[1],
                                   x2: tree.bottomright[0], y2: tree.bottomright[1],
                                   x3: tree.topright[0]   , y3: tree.topright[1],
                                   x4: tree.topleft[0]    , y4: tree.topleft[1]}});


            for (let i = 0; i < tree.children.length; i++) {
                recursiveDraw(tree.children[i], selected);
            }
        };

        // Initialize the arrays to sort and draw the nodes by depth
        sortedNodes = [];
        startPoints = [];
        endPoints = [];
        for (let i = 0; i <= originalTree.maxDepth; i++) {
            sortedNodes.push([]);
            startPoints.push([]);
            endPoints.push([]);
        }

        recursiveDepthSort(originalTree); // Sort nodes by level in a nested array
        simpleCompute(); // Compute all the coordinates for all of the nodes
        recursiveDraw(originalTree, false); // Compute all draws for the tree

        return draws;
    }

    public getForm(formFactory: FormFactory) {
        return formFactory.createFormBuilder()
            .addNumberField('height', 800, {label: 'Height'})
            .addNumberField('width', 600, {label: 'Width'})
            .addSliderField('reclaimCoefficient', 50, {label: "Reclaiming coefficient", min: 0, max: 100})
            .getForm();
    }

    public getName(): string {
        return 'Space Reclaiming Stack';
    }

    public getThumbnailImage(): string | null {
        return '/assets/images/visualization-simple-tree-map.png';
    }

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
/** @end-author Nico Klaassen */
