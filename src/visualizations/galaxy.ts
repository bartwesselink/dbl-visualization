/** @author Roan Hofland */
import {Visualizer} from '../interfaces/visualizer';
import {OpenGL} from '../opengl/opengl';
import {FormFactory} from '../form/form-factory';
import {ShaderMode} from "../opengl/shaders/shaderMode";
import {Draw} from '../interfaces/draw';
import {VisualizerInput} from '../interfaces/visualizer-input';
import {Node} from "../models/node";
import {Palette} from "../models/palette";
import {Form} from '../form/form';

export class Galaxy implements Visualizer {
    public requireAntiAliasing: boolean= false;
    public shapesPerNode: number = 1;
    
    public draw(input: VisualizerInput): Draw[] {
            const tree = input.tree;
            const draws = new Array();
            const settings = input.settings;
            
            const compute = (parent: Node, cx: number, cy: number, rad: number, offset: number): void => {
                draws.push({ 
                    type: 10 /** FillCircle **/, 
                    identifier: parent.identifier,
                    options: { 
                        x: cx, 
                        y: cy, 
                        radius: rad
                    } 
                });
                if(parent.subTreeSize > 1){
                    var dr = (2 * Math.PI) / parent.children.length;
                    var r = offset;
                    rad /= 4;
                    var size;
                    if(parent.subTreeSize - 1 == parent.children.length){
                        size = Math.min(rad, ((2 * Math.PI * rad * 6) / parent.children.length) / 2);
                    }else{
                        size = Math.min(rad, ((2 * Math.PI * rad * 6) / parent.children.length) / 5);
                    }
                    if(settings.rim){
                        draws.push({ 
                            type: 11 /** DrawCircle **/, 
                            linked: parent.identifier,
                            options: { 
                                x: cx, 
                                y: cy, 
                                radius: rad * 6
                            } 
                        });
                    }
                    for(let child of parent.children){
                        compute(child, cx + rad * 6 * Math.cos(r), cy + rad * 6 * Math.sin(r), size, r);
                        r += dr;
                    }
                }
            };
            
            compute(tree, 0, 0, 400, 0);
            
            return draws;
    }
    
    public getForm(formFactory: FormFactory): Form {
        return formFactory.createFormBuilder()
            .addToggleField('rim', true, {label: 'Show orbit'})
            .getForm();
    }

    public getName(): string {
        return 'Galaxy';
    }

    public getThumbnailImage(): string | null {
        return '/assets/images/visualization-galaxy.png';
    }

    public enableShaders(gl: OpenGL): void {
        gl.enableShaders(ShaderMode.FILL_CIRCLE);
        gl.enableShaders(ShaderMode.DRAW_CIRCLE);
    }
    
    public optimizeShaders(gl: OpenGL): void {
        gl.optimizeFor(ShaderMode.DRAW_CIRCLE);
        gl.optimizeFor(ShaderMode.FILL_CIRCLE);
    }
    
    public updateColors(gl: OpenGL, input: VisualizerInput, draws: Draw[]): void{
        this.recolor(input.tree, input.palette, gl, draws, input.tree.selected);
        for(var i = input.tree.subTreeSize; i < draws.length; i++){
            gl.copyColor(draws[draws[i].linked].glid, draws[i].glid);
        }
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
}
/** @end-author Roan Hofland */