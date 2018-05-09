import {OpenGL} from '../opengl/opengl';
import {Node} from '../models/node';
import {Form} from '../form/form';
import {FormFactory} from '../form/form-factory';

/** @author Bart Wesselink */
export interface Visualizer {
    getName(): string;
    getThumbnailImage(): string;
    getForm(formFactory: FormFactory): Form|null;
    applySettings(settings: object): void;
    draw(tree: Node, gl: OpenGL): void;
}
/** @end-author Bart Wesselink */