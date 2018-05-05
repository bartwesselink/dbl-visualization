import {Visualizer} from '../interfaces/visualizer';
import {Node} from '../models/node';
import {OpenGL} from '../opengl/opengl';
import {ElementRef, ViewChild} from "@angular/core";

export class OpenglDemoTree implements Visualizer {
    @ViewChild('canvas') private canvas: ElementRef;

    public draw(tree: Node, gl: OpenGL) {
        /** @author Nico Klaassen */

        // Draw axis - range and domain: [-100, 100]
        gl.fillAAQuad(-200, -1, 400, 2, [1, 0, 0, 1]); // X axis
        gl.fillAAQuad(-1, -200, 2, 400, [1, 0, 0, 1]); // Y axis

        for (let i = 0; i <= 20; i++) {
            const offset = 10 * i;
            gl.fillAAQuad(offset, -1, 2, 2, [0, 0, 0, 1]); // x+ ticks
            gl.fillAAQuad(-offset, -1, 2, 2, [0, 0, 0, 1]); // x- ticks
            gl.fillAAQuad(-1, offset, 2, 2, [0, 0, 0, 1]);  // y+ ticks
            gl.fillAAQuad(-1, -offset, 2, 2, [0, 0, 0, 1]); // y- ticks
        }

        // Some quad examples
        gl.fillAAQuad(100, 100, 100, 100, [0, 1, 0, 1]);
        gl.drawAAQuad(100, -200, 100, 100, [0, 1, 0, 1]);
        gl.fillLinedAAQuad(-200, -200, 100, 100, [0, 1, 0, 1], [0, 0, 0, 1]);
        gl.drawRotatedQuad(-200, 100, 100, 100, 45, [0, 1, 0, 1]);

        // Rotation dense example
        let startX = -720;
        let startY = 300;
        let offsetX = 4;
        let quadWidth = 5;
        let quadHeight = 100;
        let rotationOffset = 1;
        let outlineColor = [0, 0, 0, 1];
        for (let i = 0; i <= 360; i++) {
            const randomColor = [
                Math.random(),
                Math.random(),
                Math.random(),
                1
            ];
            const x = startX + offsetX * i;
            const rotationDegrees = rotationOffset * i;
            gl.fillLinedRotatedQuad(x, startY, quadWidth, quadHeight, rotationDegrees, randomColor, outlineColor);
            gl.fillLinedRotatedQuad(x, -startY, quadWidth, quadHeight, -rotationDegrees, randomColor, outlineColor);
        }

        // Rotation sparse example
        startX = -720;
        startY = 150;
        offsetX = 16;
        quadWidth = 10;
        quadHeight = 10;
        rotationOffset = 4;
        outlineColor = [0, 0, 0, 1];
        for (let i = 0; i <= 90; i++) {
            const randomColor = [
                Math.random(),
                Math.random(),
                Math.random(),
                1
            ];
            const x = startX + offsetX * i;
            const rotationDegrees = rotationOffset * i;
            gl.fillLinedRotatedQuad(x, startY, quadWidth, quadHeight, rotationDegrees, randomColor, outlineColor);
            gl.fillLinedRotatedQuad(x, -startY, quadWidth, quadHeight, -rotationDegrees, randomColor, outlineColor);
        }


        /** @end-author Nico Klaassen */
    }

    public getName(): string {
        return 'OpenGL Demo Tree';
    }
}
