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
    public requireAntiAliasing: boolean = false;
    public shapesPerNode: number = 1;

    /** @author Bart Wesselink */
    public draw(input: VisualizerInput): Draw[] {
        const tree = input.tree;
        const settings = input.settings;
        const draws: Draw[] = [];

        let baseRadius = settings.baseRadius;
        let scaleRadius = settings.scaleRadius;
        let radiusMargin = settings.radiusMargin;
        let relativeSliceMargin = settings.sliceMargin;
        let maxDegrees = settings.maxDegrees;

        const generate = (node: Node, startAngle: number, endAngle: number, near: number, innerRadius: number, isLastChild: boolean = true, isSelected: boolean = false) => {
            let far = near + innerRadius;

            near += radiusMargin; // add a small margin

            draws.push({ type: 17 /** FillRingSlice **/, identifier: node.identifier, options: { x: 0, y: 0, near: near, far: far, start: startAngle, end: endAngle}});

            let newStartAngle = startAngle;

            const size = (endAngle - startAngle);

            // calculate slice margin
            let sliceMargin = size * (relativeSliceMargin / 1000);

            // calculate how much space will be used for margin
            const margins = (node.children.length - 1) * sliceMargin;

            let childCounter = 0;
            for (const child of node.children) {
                childCounter++;

                const last = childCounter === node.children.length;

                // calculate the fraction of the ring slice. Minus one is to extract the root of the current subtree
                const factor = child.subTreeSize / (node.subTreeSize - 1);

                // convert fraction to an angle, and increase the startAngle
                let angle = ((size - margins) * factor + newStartAngle );

                generate(child, newStartAngle, angle, far, innerRadius * scaleRadius, last, isSelected);

                // iterate to the the next angle
                newStartAngle = angle + sliceMargin;
            }
        };

        generate(tree, 0, maxDegrees, 0, baseRadius);

        return draws;
    }

    public getForm(formFactory: FormFactory): Form | null {
        return formFactory.createFormBuilder()
            .addSliderField('baseRadius', 60, {label: 'Base radius', min: 30, max: 100})
            .addSliderField('scaleRadius', 0.9, {label: 'Reduce radius per level factor', step: 0.1, min: 0.1, max: 1})
            .addSliderField('radiusMargin', 4, {label: 'Margin between levels', min: 0, max: 8})
            .addSliderField('sliceMargin', 5, {label: 'Relative margin between slices (‰)', min: 0, max: 20})
            .addSliderField('maxDegrees', 360, {label: 'Total number of degrees to draw across', min: 0, max: 360})
            .getForm();
    }

    public getName(): string {
        return 'Sunburst';
    }

    public getThumbnailImage(): string | null {
        return 'assets/images/visualization-sunburst.png';
    }

    public enableShaders(gl: OpenGL): void {
        gl.enableShaders(ShaderMode.FILL_RING_SLICE);
    }
    /** @end-author Bart Wesselink */
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
