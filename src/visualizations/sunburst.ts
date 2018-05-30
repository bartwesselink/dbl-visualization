import {Visualizer} from '../interfaces/visualizer';
import {Form} from '../form/form';
import {FormFactory} from '../form/form-factory';
import {Draw} from '../interfaces/draw';
import {VisualizerInput} from '../interfaces/visualizer-input';
import {Node} from '../models/node';

export class Sunburst implements Visualizer {
    /** @author Bart Wesselink */
    public draw(input: VisualizerInput): Draw[] {
        const tree = input.tree;
        const draws: Draw[] = [];

        let startColor = [52 / 255, 99 / 255, 10 / 255, 1];
        let baseRadius = 60;
        let scaleRadius = 0.9;
        let radiusMargin = 4;
        let sliceMargin = 2;

        const generate = (node: Node, startAngle: number, endAngle: number,near: number, innerRadius: number, color: number[], depth: number = 0) => {
            let far = near + innerRadius;
            let drawnEndAngle = endAngle;

            if (depth !== 0) {
                near += radiusMargin;
                drawnEndAngle -= sliceMargin;
            }

            draws.push({ type: 17 /** FillRingSlice **/, identifier: node.identifier, options: { x: 0, y: 0, near: near, far: far, start: startAngle, end: drawnEndAngle, color: color }});

            let newStartAngle = startAngle;

            // work from a darker color to a lighter color, based on sub tree size
            const dividableR: number = 255 - color[0] * 255;
            const dividableG: number = 255 - color[1] * 255;
            const dividableB: number = 255 - color[2] * 255;

            const dividable = Math.min(dividableR, dividableG, dividableB);

            for (const child of node.children) {
                // calculate the fraction of the ring slice. Minus one is to extract the root of the current subtree
                const factor = child.subTreeSize / (node.subTreeSize - 1);

                // convert fraction to an angle, and increase the startAngle
                const angle = (endAngle - startAngle) * factor + newStartAngle;

                console.log(child.subTreeDepth);

                // start calculating the color part
                const r: number = color[0] * 255 + dividable * factor;
                const g: number = color[1] * 255 + dividable * factor;
                const b: number = color[2] * 255 + dividable * factor;

                let newColor = [r / 255, g / 255, b / 255, 1];

                generate(child, newStartAngle, angle, far, innerRadius * scaleRadius, newColor, depth + 1);

                // iterate to the the next angle
                newStartAngle = angle;

            }
        };

        generate(tree, 0, 360, 0, baseRadius, startColor);

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
