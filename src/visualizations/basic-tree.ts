import {Visualizer} from '../interfaces/visualizer';
import {Node} from '../models/node';
import {FormFactory} from '../form/form-factory';
import {Form} from "../form/form";
import {Draw} from '../interfaces/draw';
import {VisualizerInput} from '../interfaces/visualizer-input';
import {ShaderMode} from "../opengl/shaders/shaderMode";
import {OpenGL} from "../opengl/opengl";

/** @author Mathijs Boezer */
export class BasicTree implements Visualizer {
    public draw(input: VisualizerInput): Draw[] {
        let t0 = +(new Date());
        const tree: Node = input.tree;
        const draws: Draw[] = [];
        const widthMultiplier = input.settings.width; // distance between nodes horizontally
        const heightMultiplier = input.settings.height; // the vertical distance between nodes in terms of subtree size
        const color = [0, 0, 0, 1]; // black
        const selectedColor = [0.4, 0.4, 0.4, 1]; // grey
        const yOffset = -400; // move the origin to the bottom instead of middle with 50px of spacing
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
        const scalar: number = (900 / height) * 0.9; // number to multiply each coordinate by to fit the tree by height in the window with 10% spacing around it

        const generate: (tree: Node, origin: number[], selectedAncestor: boolean) => void = (tree: Node, origin: number[], selectedAncestor: boolean): void => {
            selectedAncestor = selectedAncestor || tree.selected; // whether this node or an ancestor is selected determines its color
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

                    // draw 'edge' to children, its actually a quad though
                    draws.push({
                        type: 1, // filled rotated quad
                        options: {
                            x: middleX * scalar,
                            y: middleY  * scalar + yOffset,
                            width: child.subTreeSize * scalar, // subtree size as width
                            height: height * scalar,
                            rotation: angle,
                            color: selectedAncestor ? selectedColor : color,
                        }
                    });

                    generate(child, childOrigin, selectedAncestor); // draw child node and subtree
                    x += child.subTreeSize * widthMultiplier; // add subtree size again so the next child won't overlap with the current
                }
            }

            // draw node on top of edges
            draws.push({
                type: 10, // filled circle
                options: {
                    x: origin[0] * scalar,
                    y: origin[1] * scalar + yOffset,
                    radius: tree.subTreeSize * scalar * 0.5, // subtree size as diameter
                    color: selectedAncestor ? selectedColor : color,
                },
                identifier: tree.identifier, // selecting on the nodes
            });
        };
        generate(tree, [0, 0], false); // root starts at origin and has no selected ancestors
        return draws;
    }

    public getForm(formFactory: FormFactory): Form {
        return formFactory.createFormBuilder()
            .addSliderField('width', 3, { label: 'Width', min: 0.5, max: 10 })
            .addSliderField('height', 3, { label: 'Height', min: 0.5, max: 10 })
            .getForm();
    }

    public getName(): string {
        return "Basic Tree";
    }

    public getThumbnailImage(): string|null {
        return '/assets/images/visualization-basic-tree.png';
    }

    public enableShaders(gl: OpenGL): void {
        console.log("test");
        gl.enableShaders(ShaderMode.FILL_CIRCLE);
    }

    // public optimizeShaders(gl: OpenGL): void {
    //     gl.optimizeDefault();
    //     gl.optimizeFor(ShaderMode.FILL_CIRCLE);
    //     gl.optimizeFor(ShaderMode.DRAW_CIRCLE);
    //     gl.optimizeFor(ShaderMode.DRAW_CIRCLE_SLICE);
    //     gl.optimizeFor(ShaderMode.FILL_CIRCLE_SLICE);
    //     gl.optimizeFor(ShaderMode.DRAW_RING_SLICE);
    //     gl.optimizeFor(ShaderMode.FILL_RING_SLICE);
    //     gl.optimizeFor(ShaderMode.CIRCULAR_ARC);
    // }
}
/** @end-author Mathijs Boezer */
