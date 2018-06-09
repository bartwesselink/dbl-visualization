import {Visualizer} from '../interfaces/visualizer';
import {Node} from '../models/node';
import {OpenGL} from '../opengl/opengl';
import {FormFactory} from '../form/form-factory';
import {Form} from "../form/form";
import {Draw} from '../interfaces/draw';
import {VisualizerInput} from '../interfaces/visualizer-input';
import {DrawType} from '../enums/draw-type';

/** @author Mathijs Boezer */
export class BasicTree implements Visualizer {
    public draw(input: VisualizerInput): Draw[] {
        const tree: Node = input.tree;
        const draws: Draw[] = [];
        const initialOrigin: number[] = [0, 0];
        const widthMultiplier = input.settings.width; // distance between nodes horizontally
        const heightMultiplier = input.settings.height; // the vertical distance between nodes in terms of subtree size
        const color = [0, 0, 0, 1]; // black
        const selectedColor = [0.3, 0.3, 0.3, 1]; // grey
        const yOffset = -400; // move the origin to the bottom instead of middle with 50px of spacing
        let node = tree;
        let height = 0;
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
        console.log(height);
        const scalar: number = (900 / height) * 0.9; // number to multiply each coordinate by to fit the tree by height in the window with 10% spacing around it
        const leafdepths = [];
        const generate: (tree: Node, origin: number[], selectedSubtree: boolean) => void = (tree: Node, origin: number[], selectedSubtree: boolean): void => {
            selectedSubtree = selectedSubtree || tree.selected;

            if (tree.children.length > 0) {
                let x: number = -(tree.subTreeSize - 1.0) * widthMultiplier; // x coordinate for leftmost child
                let childOrigin: number[];
                for (let child of tree.children) {
                    x += child.subTreeSize * widthMultiplier; // first add subtree size to x
                    childOrigin = [origin[0] + x, origin[1] + tree.subTreeSize * heightMultiplier]; // calculate origin for child
                    draws.push({
                        type: 15, // line
                        options: {
                            x1: origin[0] * scalar,
                            y1: origin[1] * scalar + yOffset,
                            x2: childOrigin[0] * scalar,
                            y2: childOrigin[1] * scalar + yOffset,
                            color: color,
                        }
                    }); // draw edge
                    generate(child, childOrigin, selectedSubtree); // draw child node and subtree
                    x += child.subTreeSize * widthMultiplier; // add subtree size again so the next child won't overlap with the current
                }
            } else {
                leafdepths.push(origin[1]);
            }

            draws.push({
                type: 10, // filled circle
                options: {
                    x: origin[0] * scalar,
                    y: origin[1] * scalar + yOffset,
                    radius: tree.subTreeSize * scalar * 0.5, // subtree size as diameter
                    color: selectedSubtree ? selectedColor : color,
                },
                identifier: tree.identifier,
            });
        };
        generate(tree, initialOrigin, false);

        console.log(leafdepths.sort()[leafdepths.length-1]);
        return draws;
    }

    public getForm(formFactory: FormFactory): Form {
        return formFactory.createFormBuilder()
            .addSliderField('width', 3, { label: 'Width', min: 0.5, max: 10 })
            .addSliderField('height', 2, { label: 'Height', min: 0.5, max: 10 })
            .getForm();
    }

    public getName(): string {
        return "Basic Tree";
    }

    public getThumbnailImage(): string|null {
        return null;
    }
}
/** @end-author Mathijs Boezer */
