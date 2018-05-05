import {Visualizer} from '../interfaces/visualizer';
import {Node} from '../models/node';
import {OpenGL} from '../opengl/opengl';

export class GeneralizedPythagorasTree implements Visualizer {
    public draw(tree: Node, gl: OpenGL) {
        /** @author Roan Hofland */
        //test visualisations
        gl.drawAAQuad(0,    0,    100, 100, [1, 0, 0, 1]);
        gl.drawAAQuad(-100, -100, 100, 100, [0, 1, 0, 1]);
        gl.drawAAQuad(0,    -300, 200, 200, [0, 0, 1, 1]);

        for(var i = 0; i <= 36; i++){
            gl.drawRotatedQuad(-800 + 25 + 43 * i, 200, 35, 35, i * 10, [1, 0, 0, 1]);
        }
        for(var i = 0; i <= 18; i++){
            gl.drawRotatedQuad(-800 + 25 + 86 * i, 300, 70, 35, i * 20, [1, 0, 0, 1]);
        }


        //scalability hell test (change the limit)
        for(var i = 0; i < 5; i++){
            //recall that our viewport is fixed at 1600x900, but we will never need this fact except for this test case since visualisations can go beyond the viewport
            var x = (Math.random() - 0.5) * 1600;
            var y = (Math.random() - 0.5) * 900;
            gl.drawAAQuad(x, y, 50, 50, [Math.random(), Math.random(), Math.random(), Math.random()]);
        }
        /** @end-author Roan Hofland */
    }

    public getName(): string {
        return 'Generalized Pythagoras Tree';
    }
}