import {Visualizer} from '../interfaces/visualizer';
import {Node} from '../models/node';
import {FormFactory} from '../form/form-factory';
import {Form} from "../form/form";
import {Draw} from '../interfaces/draw';
import {VisualizerInput} from '../interfaces/visualizer-input';
import {ShaderMode} from "../opengl/shaders/shaderMode";
import {OpenGL} from "../opengl/opengl";
import {Palette} from "../models/palette";

/** @author Mathijs Boezer */
export class BasicTree implements Visualizer {
    public requireAntiAliasing: boolean = true;
    public shapesPerNode: number = 2;

    public draw(input: VisualizerInput): Draw[] {
        const widthMultiplier = input.settings.width; // distance between nodes horizontally
        const heightMultiplier = input.settings.height; // the vertical distance between nodes in terms of subtree size
        const nodeWidth = input.settings.nodeWidth / 100; // whether the nodes are the same width as the edges, or bigger divide by 100 since we only use integers in sliders
        const growDown = input.settings.growDown; // whether the root of the tree is at the top and grows upwards, or the inverse

        const tree: Node = input.tree;
        const draws: Draw[] = [];
        const yOffset = -400 * (growDown ? -1 : 1); // move the origin to the bottom (or top if grow down) instead of middle with 50px of spacing
        const radianToDegreeMultiplier = 180 / Math.PI;

        let node = tree;
        let height = 0;
        // calculate height in pixels
        while (node.children.length > 0) {
            height += node.subTreeSize * heightMultiplier;
            let maxChild = node.children[0];
            for (let child of node.children) {
                if (child.subTreeSize > maxChild.subTreeSize) {
                    maxChild = child;
                }
            }
            node = maxChild;
        }
        const scalarX: number = (900 / height) * 0.9; // number to multiply each coordinate by to fit the tree by height in the window with 10% spacing around it
        const scalarY = scalarX * (growDown ? -1 : 1); // negate scalar if growing downwards

        const generate: (tree: Node, origin: number[], selectedAncestor: boolean) => void = (tree: Node, origin: number[], selectedAncestor: boolean): void => {
            if (tree.children.length > 0) {
                let x: number = -(tree.subTreeSize - 1.0) * widthMultiplier; // relative x coordinate for leftmost child
                let y: number = tree.subTreeSize * heightMultiplier; // relative y coordinate for children
                let childOrigin: number[];
                for (let child of tree.children) {
                    x += child.subTreeSize * widthMultiplier; // first add subtree size to x
                    childOrigin = [origin[0] + x, origin[1] + y]; // calculate origin for child

                    let middleX = (origin[0] + childOrigin[0]) / 2; // middle point of edge from parent to child
                    let middleY = (origin[1] + childOrigin[1]) / 2; // middle point of edge from parent to child
                    let height = ((origin[0] - childOrigin[0])**2 + (origin[1] - childOrigin[1])**2)**0.5; // edge length

                    let angle = Math.acos((origin[1] - childOrigin[1]) / height); // angle between y axis and edge
                    angle = angle * radianToDegreeMultiplier; // convert to degrees
                    angle = childOrigin[0] < origin[0] ? -angle : angle; // negate if it should rotate counterclockwise
                    angle = growDown ? -angle : angle; // negate if growing downwards

                    // draw 'edge' to children, its actually a quad though
                    draws.push({
                        type: 1, // filled rotated quad
                        options: {
                            x: middleX * scalarX,
                            y: middleY  * scalarY + yOffset,
                            width: child.subTreeSize * scalarX, // subtree size as width
                            height: height * scalarX,
                            rotation: angle,
                        },
                        linked: tree.identifier
                    });

                    generate(child, childOrigin, selectedAncestor); // draw child node and subtree
                    x += child.subTreeSize * widthMultiplier; // add subtree size again so the next child won't overlap with the current
                }
            }

            // draw node on top of edges
            draws.push({
                type: 10, // filled circle
                options: {
                    x: origin[0] * scalarX,
                    y: origin[1] * scalarY + yOffset,
                    radius: tree.subTreeSize * scalarX * nodeWidth, // subtree size as diameter or radius depending on the settings
                },
                identifier: tree.identifier, // selecting on the nodes
            });
        };
        generate(tree, [0, 0], false); // root starts at origin and has no selected ancestors
        return draws;
    }

    public getForm(formFactory: FormFactory): Form {
        return formFactory.createFormBuilder()
            .addSliderField('width', 5, { label: 'Width', min: 0.5, max: 10 })
            .addSliderField('height', 3, { label: 'Height', min: 0.5, max: 10 })
            .addSliderField('nodeWidth', 75, { label: 'Node size', min: 50, max: 100 }) // sliders only work on integers afaik so multiply by 100
            .addToggleField('growDown', false, {label: 'Grow downwards'})
            .getForm();
    }

    public getName(): string {
        return "Basic Tree";
    }

    public getThumbnailImage(): string|null {
        return '/assets/images/visualization-basic-tree.png';
    }

    public enableShaders(gl: OpenGL): void {
        gl.enableShaders(ShaderMode.FILL_CIRCLE);
    }

    public optimizeShaders(gl: OpenGL): void {
        gl.optimizeDefault();
        gl.optimizeFor(ShaderMode.FILL_CIRCLE);
    }
    /** @end-author Mathijs Boezer */
    /** @author Roan Hofland */
    public updateColors(gl: OpenGL, input: VisualizerInput, draws: Draw[]): void{
        this.recolor(input.tree, input.palette, gl, draws, input.tree.selected);
        for(var i = input.tree.subTreeSize; i < draws.length; i++){
            gl.copyColor(draws[draws[i].linked].glid, draws[i].glid);
        }
    }

    private recolor(tree: Node, palette: Palette, gl: OpenGL, draws: Draw[], selected: boolean){
        if(draws[tree.identifier].type == 10){
            if (selected || tree.selected) {
                selected = true;
                gl.setColor(draws[tree.identifier].glid, palette.gradientColorMapSelected[tree.maxDepth][tree.depth]);
            } else {
                gl.setColor(draws[tree.identifier].glid, palette.gradientColorMap[tree.maxDepth][tree.depth]);
            }
        }
        for(let child of tree.children){
            this.recolor(child, palette, gl, draws, selected);
        }
    }
    /** @end-author Roan Hofland */
}
