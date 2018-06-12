import {Visualizer} from '../interfaces/visualizer';
import {Form} from '../form/form';
import {FormFactory} from '../form/form-factory';
import {Draw} from '../interfaces/draw';
import {VisualizerInput} from '../interfaces/visualizer-input';
import {Node} from '../models/node';
import {Palette} from '../models/palette';
import {OpenGL} from '../opengl/opengl';
import {ShaderMode} from '../opengl/shaders/shaderMode';

export class Sunburst implements Visualizer {
    /** @author Bart Wesselink */
    public draw(input: VisualizerInput): Draw[] {
        const tree = input.tree;
        const settings = input.settings;
        const draws: Draw[] = [];
        const palette: Palette = input.palette;

        let color: number[];
        let baseRadius = settings.baseRadius;
        let scaleRadius = settings.scaleRadius;
        let radiusMargin = settings.radiusMargin;
        let scaleSliceMargin = settings.scaleSliceMargin;
        let defaultSliceMargin = settings.sliceMargin;

        const generate = (node: Node, startAngle: number, endAngle: number, near: number, innerRadius: number, sliceMargin: number = defaultSliceMargin, isLastChild: boolean = true, isSelected: boolean = false) => {
            if (node.selected === true || isSelected) {
                isSelected = true;
                color = palette.gradientColorMapSelected[node.maxDepth][node.depth];
            } else {
                color = palette.gradientColorMap[node.maxDepth][node.depth];
            }

            sliceMargin = sliceMargin * scaleSliceMargin;

            let far = near + innerRadius;
            let drawnEndAngle = endAngle;

            near += radiusMargin; // add a small margin
            drawnEndAngle -= sliceMargin;

            if (drawnEndAngle < 0) {
                // TODO: find out whether this mathematically possible, I have'nt encountered such a case
                console.error('Visualization error');
            }

            draws.push({ type: 17 /** FillRingSlice **/, identifier: node.identifier, options: { x: 0, y: 0, near: near, far: far, start: startAngle, end: drawnEndAngle, color }});

            let newStartAngle = startAngle;

            let childCounter = 0;
            for (const child of node.children) {
                childCounter++;

                // calculate the fraction of the ring slice. Minus one is to extract the root of the current subtree
                const factor = child.subTreeSize / (node.subTreeSize - 1);

                // convert fraction to an angle, and increase the startAngle
                const angle = (endAngle - startAngle) * factor + newStartAngle;

                generate(child, newStartAngle, angle, far, innerRadius * scaleRadius, sliceMargin, childCounter === node.children.length, isSelected);

                // iterate to the the next angle
                newStartAngle = angle;
            }
        };

        generate(tree, 0, 360, 0, baseRadius);

        return draws;
    }

    public getForm(formFactory: FormFactory): Form | null {
        return formFactory.createFormBuilder()
            .addSliderField('baseRadius', 60, {label: 'Base radius', min: 30, max: 100})
            .addSliderField('scaleRadius', 0.9, {label: 'Reduce radius per level factor', step: 0.1, min: 0.1, max: 1})
            .addSliderField('radiusMargin', 4, {label: 'Margin between levels', min: 0, max: 8})
            .addSliderField('sliceMargin', 2, {label: 'Margin between slices', min: 0, max: 8})
            .addSliderField('scaleSliceMargin', 0.9, {label: 'Reduce slice margin per level factor', step: 0.1, min: 0.1, max: 1})
            .getForm();
    }

    public getName(): string {
        return 'Sunburst';
    }

    public getThumbnailImage(): string | null {
        return '/assets/images/visualization-sunburst.png';
    }

    public enableShaders(gl: OpenGL): void {
        gl.enableShaders(ShaderMode.FILL_RING_SLICE);
    }

    public optimizeShaders(gl: OpenGL): void {
        gl.optimizeDefault();
        gl.optimizeFor(ShaderMode.FILL_RING_SLICE);
    }

    /** @end-author Bart Wesselink */
}
