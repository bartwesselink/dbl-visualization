/** @author Roan Hofland */
import {Visualizer} from '../interfaces/visualizer';
import {OpenGL} from '../opengl/opengl';
import {FormFactory} from '../form/form-factory';
import {ShaderMode} from "../opengl/shaders/shaderMode";
import {Draw} from '../interfaces/draw';
import {VisualizerInput} from '../interfaces/visualizer-input';

export class Roan implements Visualizer {
    
    public draw(input: VisualizerInput): Draw[] {
            
            
            
            
            
            
            
            
            
            
            
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