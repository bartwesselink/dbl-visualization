import {Visualizer} from '../interfaces/visualizer';
import {Node} from '../models/node';
import {FormFactory} from '../form/form-factory';
import {Draw} from '../interfaces/draw';
import {VisualizerInput} from '../interfaces/visualizer-input';
import {Palette} from "../models/palette";
import {NodeSpaceReclaimingStack} from "../models/node-space-reclaiming-stack";
import {OpenGL} from "../opengl/opengl";

/** @author Nico Klaassen */
export class SpaceReclaimingStack implements Visualizer {
    public requireAntiAliasing: boolean = true;
    public shapesPerNode: number = 1;

    public draw(input: VisualizerInput): Draw[] {
        const originalTree = input.tree as NodeSpaceReclaimingStack;
        const draws: Draw[] = [];
        const settings: any = input.settings;

        // define variables
        let globalHeight = settings.height;
        let globalWidth = settings.width;
        let reclaimCoefficient = settings.reclaimCoefficient / 100; // Percentage
        let offsetBasis = settings.offset / 200; // Percentage 0 - 50%
        let maximumOffset = settings.maximumOffset;
        const levelHeight = globalHeight / originalTree.maxDepth;

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
        };

        const simpleCompute = (basisDepth: number): void => {//tree:NodeSpaceReclaimingStack, index: number): void => {
            for (let depth = basisDepth; depth < sortedNodes.length; depth++) {
                // Points at the top
                for (let i = 0; i < sortedNodes[depth].length; i++) {
                    const tree = sortedNodes[depth][i];
                    const topY = globalHeight / 2 - levelHeight * tree.depth;

                    if (tree.depth != basisDepth) { // basisDepth can only be 1 node, a root of the (sub)tree
                        if (tree.parent.children.length > 1) {
                            const width = Math.abs(tree.parent.bottomleft[0] - tree.parent.bottomright[0]);
                            const index = calculateIndex(tree);

                            if (index == 0) {
                                tree.topleft = tree.parent.bottomleft;
                                tree.topright = [tree.parent.bottomleft[0] + width / tree.parent.children.length, topY];

                            } else if (index < tree.parent.children.length - 1) {
                                tree.topleft = [tree.parent.bottomleft[0] + width / tree.parent.children.length * index, topY];
                                tree.topright = [tree.parent.bottomleft[0] + width / tree.parent.children.length * (index + 1), topY];

                            } else {
                                tree.topleft = [tree.parent.bottomleft[0] + width / tree.parent.children.length * index, tree.parent.bottomleft[1]];
                                tree.topright = [tree.parent.bottomright[0], tree.parent.bottomright[1]];
                            }
                        } else { // Only child
                            tree.topleft = tree.parent.bottomleft;
                            tree.topright = tree.parent.bottomright;
                        }
                    } else { // Root case of the given tree
                        tree.topleft = [-globalWidth / 2, topY];
                        tree.topright = [globalWidth / 2, topY];
                    }
                }


                // Points at the bottom
                let left;
                let right;
                let segmentWidth;
                let offset;

                if (depth > 0) { // reclaim coefficient implementation
                    let parentWidth = Math.abs(sortedNodes[depth][0].topleft[0] - sortedNodes[depth][sortedNodes[depth].length - 1].topright[0]);
                    parentWidth = parentWidth + (globalWidth - parentWidth) * reclaimCoefficient;
                    offset = Math.min(parentWidth / sortedNodes[depth].length * offsetBasis, maximumOffset);
                    segmentWidth = (parentWidth - offset * (sortedNodes[depth].length - 1)) / sortedNodes[depth].length;

                    left = -parentWidth / 2;
                } else {
                    offset = Math.min(globalWidth / sortedNodes[depth].length * offsetBasis, maximumOffset);
                    segmentWidth = (globalWidth - offset * (sortedNodes[depth].length - 1)) / sortedNodes[depth].length;

                    left = - globalWidth / 2;
                }

                right = left + segmentWidth;

                for (let i = 0; i < sortedNodes[depth].length; i++) {
                    const tree = sortedNodes[depth][i];
                    const bottomY = globalHeight / 2 - levelHeight * (tree.depth + 1);

                    tree.bottomleft = [left, bottomY];
                    tree.bottomright = [right, bottomY];

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

        recursiveDepthSort(originalTree);   // Sort nodes by level in a nested array
        simpleCompute(originalTree.depth);  // Compute all the coordinates for all of the nodes
        recursiveDraw(originalTree, false); // Compute all draws for the tree

        return draws;
    }

    public getForm(formFactory: FormFactory) {
        return formFactory.createFormBuilder()
            .addNumberField('height', 800, {label: 'Height'})
            .addNumberField('width', 300, {label: 'Width'})
            .addSliderField('reclaimCoefficient', 50, {label: "Reclaiming coefficient", min: 0, max: 100})
            .addSliderField('offset', 50, {label: "Relative offset in between nodes on the same depth", min: 0, max: 100})
            .addNumberField('maximumOffset', 10, {label: 'Maximum offset'})
            .getForm();
    }

    public getName(): string {
        return 'Space Reclaiming Stack';
    }

    public getThumbnailImage(): string | null {
        return '/assets/images/visualization-space-reclaiming-stack.png';
    }

    public enableShaders(gl: OpenGL):void {
        gl.setSizeThresHold(15);
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
