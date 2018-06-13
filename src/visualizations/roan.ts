/** @author Roan Hofland */
import {Visualizer} from '../interfaces/visualizer';
import {OpenGL} from '../opengl/opengl';
import {FormFactory} from '../form/form-factory';
import {ShaderMode} from "../opengl/shaders/shaderMode";
import {Draw} from '../interfaces/draw';
import {VisualizerInput} from '../interfaces/visualizer-input';
import {Node} from "../models/node";
import {Palette} from "../models/palette";

export class Roan implements Visualizer {
    
    public draw(input: VisualizerInput): Draw[] {
            const tree = input.tree;
            const draws = new Array();
            const palette: Palette = input.palette;
            var color: number[];
            
            const compute = (parent: Node, cx: number, cy: number, rad: number): void => {
                if (parent.selected === true) {
                    color = palette.gradientColorMapSelected[parent.maxDepth][parent.depth];
                } else {
                    color = palette.gradientColorMap[parent.maxDepth][parent.depth];
                }
                draws.push({ 
                    type: 10 /** FillCircle **/, 
                    identifier: parent.identifier,
                    options: { 
                        x: cx, 
                        y: cy, 
                        radius: rad, 
                        color: color 
                    } 
                });
                if(parent.subTreeSize > 0){
                    var dr = (2 * Math.PI) / parent.children.length;
                    var r = 0;
                    rad /= 4;
                    var size = Math.min(rad, ((2 * Math.PI * rad * 6) / parent.children.length) / 4);
                    for(let child of parent.children){
                        compute(child, cx + rad * 6 * Math.cos(r), cy + rad * 6 * Math.sin(r), size);
                        r += dr;
                    }
                }
            };
            
            compute(tree, 0, 0, 400);
            
            return draws;
    }
    
    public getForm(formFactory: FormFactory) {
        return null;
    }

    public getName(): string {
        return 'Roan';
    }

    public getThumbnailImage(): string | null {
        return null;
    }

    public enableShaders(gl: OpenGL): void {
        gl.enableShaders(ShaderMode.FILL_CIRCLE);
    }
}
/** @end-author Roan Hofland */