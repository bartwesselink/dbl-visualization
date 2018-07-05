import {Visualizer} from '../interfaces/visualizer';
import {Node} from '../models/node';
import {FormFactory} from '../form/form-factory';
import {Form} from "../form/form";
import {Draw} from '../interfaces/draw';
import {VisualizerInput} from '../interfaces/visualizer-input';
import {ShaderMode} from "../opengl/shaders/shaderMode";
import {OpenGL} from "../opengl/opengl";
import {Palette} from "../models/palette";

export class Circles implements Visualizer {
    /** @author Jordy Verhoeven */

    public requireAntiAliasing: boolean = false;
    public shapesPerNode: number = 1;

    public draw(input: VisualizerInput): Draw[] {
        const tree = input.tree;
        const settings = input.settings;
        const draws: Draw[] = [];
        const color = [0, 0, 0];
        let space = 1;
        let height = 0;
        let newX;
        let newY;

        const baseSize = settings.baseSize;
        const multiplier = settings.multiplier;

        const generate = (subTree: Node, radius: number, x: number, y: number): void => {

            let pos = 0;
            let h = 1;
            let xPos = 0;

            //recurse over every node

            if (subTree.subTreeSize > 1) {

                for (let child of subTree.children) {

                    //center node

                    if (pos == 0) {

                        newX = x;
                        newY = y;

                    }

                    //linear functions that calculate the position of the circles

                    if (pos == 1) { //top to right

                        newY = y + -xPos * 2 * radius + h * 2 * radius;
                        newX = x + xPos * 2 * radius;
                        xPos++;

                    }

                    if (pos == 2) { //bottom to right

                        newY = y + xPos * 2 * radius - h * 2 * radius;
                        newX = x + xPos * 2 * radius;
                        xPos++;

                    }

                    if (pos == 3) { //top to left

                        newY = y + xPos * 2 * radius + h * 2 * radius;
                        newX = x + xPos * 2 * radius;
                        xPos--;

                    }

                    if (pos == 4) { //bottom to left

                        newY = y + -xPos * 2 * radius - h * 2 * radius;
                        newX = x + xPos * 2 * radius;
                        xPos--;

                    }

                    //draw node after position is calculated


                    draws.push({
                        type: 12 /** Cirlce **/,
                        identifier: child.identifier,
                        options: {
                            x: newX,
                            y: newY,
                            radius: radius,
                            lineColor: color,
                        }
                    });


                    //checks whether the next linear function should be used and adjusts h at the appropriate
                    //the displacement over the y axis means y should be subtracted from the position because the if statement
                    //checks if y is 0 or -2*radius of the current node, this calculation causes floating point errors on larger
                    //datasets

                    if ((newY - y < 0.00001 && (pos == 0 || pos == 1 || pos == 3)) || ((newY - y) > (-2 * radius) - 0.00001 && (newY - y < (-2 * radius) + 0.00001 && (pos == 2 || pos == 4)))) {

                        if (pos == 4) {

                            pos = 1;
                            h++;

                        }
                        else {

                            pos++;

                            if (pos == 4 && h == 1) {

                                pos = 1;
                                h++

                            }

                        }

                        if (pos == 1 || pos == 2) {

                            xPos = 0;

                        }
                        else {

                            xPos = -1;

                        }

                    }


                    //calculates the height, to calculate the radius

                    while (child.children.length > space) {

                        //The patern created adds x*4 spaces for every border

                        space = space + 4 * height;
                        height++;

                    }

                    let newRadius = radius / (2 * (height - 0.5));
                    space = 1;
                    height = 0;

                    if (child.children.length == 1) {

                        newRadius = radius * multiplier / 100;

                    }

                    generate(child, newRadius, newX, newY);


                }

            }

        };

        //draws the root

        draws.push({
            type: 12 /** Cirlce **/,
            identifier: tree.identifier,
            options: {
                x: 0,
                y: 0,
                radius: baseSize,
                lineColor: color,
            }
        });

        //calculates the radius of the cildren of the root in the same manner as before

        while (tree.children.length > space) {

            space = space + 4 * height;
            height++;

        }

        let newRadius = baseSize / (2 * (height - 0.5));
        space = 1;
        height = 0;

        if (tree.children.length == 1) {

            newRadius = baseSize * multiplier / 100;

        }

        generate(tree, newRadius, 0, 0);

        return draws;
    }

    public getForm(formFactory: FormFactory): Form | null {
        return formFactory.createFormBuilder()
            .addSliderField('baseSize', 400, { label: 'Root size', min: 100, max: 1000 })
            .addSliderField('multiplier', 75, {label: 'Single child size', min: 10, max: 90 })
            .getForm();

    }

    public getName(): string {
        return 'Circular Tree Map';
    }

    public getThumbnailImage(): string | null {
        return 'assets/images/visualization-circular-tree-map.png';
    }

    public enableShaders(gl: OpenGL): void {
        gl.enableShaders(ShaderMode.LINED_CIRCLE);
    }

    public updateColors(gl: OpenGL, input: VisualizerInput, draws: Draw[]): void {
        this.recolor(input.tree, input.palette, gl, draws, input.tree.selected);
    }

    private recolor(tree: Node, palette: Palette, gl: OpenGL, draws: Draw[], selected: boolean) {
        if (selected || tree.selected) {
            selected = true;
            gl.setColor(draws[tree.identifier].glid, palette.gradientColorMapSelected[tree.maxDepth][tree.depth]);
        } else {
            gl.setColor(draws[tree.identifier].glid, palette.gradientColorMap[tree.maxDepth][tree.depth]);
        }
        for (let child of tree.children) {
            this.recolor(child, palette, gl, draws, selected);
        }
    }

    /** @end-author Jordy Verhoeven */

}
