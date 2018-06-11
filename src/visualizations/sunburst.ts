import {Visualizer} from '../interfaces/visualizer';
import {Form} from '../form/form';
import {FormFactory} from '../form/form-factory';
import {Draw} from '../interfaces/draw';
import {VisualizerInput} from '../interfaces/visualizer-input';
import {Node} from '../models/node';
import {Palette} from '../models/palette';

export class Sunburst implements Visualizer {
    /** @author Bart Wesselink */
    public draw(input: VisualizerInput): Draw[] {
        const tree = input.tree;
        const draws: Draw[] = [];
        const palette: Palette = input.palette;

        let color: number[];
        let baseRadius = 60;
        let scaleRadius = 0.9;
        let radiusMargin = 4;
        let sliceMargin = 0;

        const generate = (node: Node, startAngle: number, endAngle: number, near: number, innerRadius: number, depth: number = 1, isLastChild: boolean = true, isSelected: boolean = false) => {
            if (tree.selected === true || isSelected) {
                isSelected = true;
                color = palette.gradientColorMapSelected[node.maxDepth][node.depth];
            } else {
                color = palette.gradientColorMap[node.maxDepth][node.depth];
            }

            let far = near + innerRadius;
            let drawnEndAngle = endAngle;

            near += radiusMargin; // add a small margin

            if (!isLastChild) {
                drawnEndAngle -= sliceMargin;
            }

            if (depth === 2) {
                console.log(Math.round(startAngle), Math.round(drawnEndAngle), near, far);
            }
            draws.push({ type: 17 /** FillRingSlice **/, identifier: node.identifier, options: { x: 0, y: 0, near: near, far: far, start: Math.round(startAngle), end: Math.round(drawnEndAngle), color }});

            let newStartAngle = startAngle;

            let childCounter = 0;
            for (const child of node.children) {
                childCounter++;

                // calculate the fraction of the ring slice. Minus one is to extract the root of the current subtree
                const factor = child.subTreeSize / (node.subTreeSize - 1);


                // convert fraction to an angle, and increase the startAngle
                const angle = (endAngle - startAngle) * factor + newStartAngle;

                generate(child, newStartAngle, angle, far, innerRadius * scaleRadius, depth + 1, childCounter === node.children.length, isSelected);

                // iterate to the the next angle
                newStartAngle = angle;
            }
        };

        generate(tree, 0, 360, 0, baseRadius);

        return draws;
    }

    public getForm(formFactory: FormFactory): Form | null {
        return formFactory.createFormBuilder()
            .addTextField('test1', 'TestValue', {label: 'Test label'})
            .addNumberField('test2', 8, {label: 'Test label'})
            .addToggleField('test3', false, {label: 'Test label'})
            .addChoiceField('test4', 'test', {label: 'Test label', expanded: false, choices: {test: 'test'}})
            .addChoiceField('test5', 'test', {label: 'Test label', expanded: true, choices: {test: 'test'}})
            .getForm();
    }

    public getName(): string {
        return 'Sunburst';
    }

    public getThumbnailImage(): string | null {
        return null;
    }

    /** @end-author Bart Wesselink */
}
