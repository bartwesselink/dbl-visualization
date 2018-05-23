import {OpenGL} from '../opengl/opengl';
import {Node} from '../models/node';
import {Form} from '../form/form';
import {FormFactory} from '../form/form-factory';
import {Draw} from './draw';
import {VisualizerInput} from './visualizer-input';

/** @author Bart Wesselink */
export interface Visualizer {
    getName(): string;
    getThumbnailImage(): string;
    getForm(formFactory: FormFactory): Form|null;
    draw(input: VisualizerInput): Draw[];
}
/** @end-author Bart Wesselink */