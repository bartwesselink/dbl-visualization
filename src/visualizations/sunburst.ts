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

        let lineColor = [1, 0, 0, 1];
        let fillColor = [0, 0, 0, 1];
        let baseRadius = 60;
        let scaleRadius = 0.9;

        const generate = (node: Node, startAngle: number, endAngle: number, near: number, innerRadius: number) => {
            let far = near + innerRadius;

            draws.push({ type: 19 /** FillLinedRingSlice **/, identifier: node.identifier, options: { x: 0, y: 0, near: near, far: far, start: startAngle, end: endAngle, fillColor: [1, 0, 0, 1], lineColor: [0, 0, 0, 1] }});

            let newStartAngle = startAngle;

            for (const child of node.children) {
                // calculate the fraction of the ring slice. Minus one is to extract the root of the current subtree
                const factor = child.subTreeSize / (node.subTreeSize - 1);

                // convert fraction to an angle, and increase the startAngle
                const angle = (endAngle - startAngle) * factor + newStartAngle;

                generate(child, newStartAngle, angle, far, innerRadius * scaleRadius);

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
