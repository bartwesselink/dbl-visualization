import {OpenGL} from '../opengl/opengl';
import {Node} from '../models/node';

/** @author Bart Wesselink */
export interface Visualizer {
    getName(): string;
    draw(tree: Node, gl: OpenGL);
}
/** @end-author Bart Wesselink */