import {Visualizer} from '../interfaces/visualizer';
import {Node} from '../models/node';
import {OpenGL} from '../opengl/opengl';
import {FormFactory} from '../form/form-factory';
import {Form} from '../form/form';


export class OpenglDemoTree implements Visualizer {
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

        // Some big green quad examples
        // Note that the misalignment of the top-left rectangle is intentional to highlight it is being drawn based on
        // an (x, y) center coordinate. Where-as (x, y) is the bottom-left coordinate for the other quads.
        gl.fillAAQuad(100, 100, 100, 100, [0, 1, 0, 1]);
        gl.drawAAQuad(100, -200, 100, 100, [0, 1, 0, 1]);
        gl.fillLinedAAQuad(-200, -200, 100, 100, [0, 1, 0, 1], [0, 0, 0, 1]);
        gl.drawRotatedQuad(-200, 100, 100, 100, 45, [0, 1, 0, 1]);

        // Rotation dense example
        let startX = -720;
        let startY = 300;
        let offsetX = 4;
        let quadWidth = 5;
        let quadHeight = 70;
        let radiusX = quadWidth / 2;
        let radiusY = quadHeight / 2;
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
            gl.fillLinedEllipsoid(x, -startY, radiusX, radiusY, rotationDegrees, randomColor, outlineColor); // Optional, precision: number
        }

        // Rotation sparse example
        startX = -720;
        startY = 225;
        offsetX = 16;
        quadWidth = 10;
        quadHeight = 10;
        radiusX = quadWidth / 2;
        radiusY = quadHeight; // Not divided by two to highlight rotation with the ellipses
        rotationOffset = 4;
        outlineColor = [0, 0, 0, 1];
        for (let i = 0; i <= 90; i++) {
            // Generate random color
            const randomColor = [
                Math.random(),
                Math.random(),
                Math.random(),
                1
            ];
            const x = startX + offsetX * i;
            const rotationDegrees = rotationOffset * i;
            gl.fillLinedRotatedQuad(x, startY, quadWidth, quadHeight, rotationDegrees, randomColor, outlineColor);
            gl.fillLinedEllipsoid(x, -startY, radiusX, radiusY, rotationDegrees, randomColor, outlineColor); // optional, precision: number
        }

        // Sine wave example
        startX = -720;
        startY = 30;
        let amplitude = 10;
        let radius = 2;
        let fillColor = [1, 0, 0, 1];
        outlineColor = [0, 0, 0, 1];

        for (let i = 0; i <= 360; i++) {
            const x = i / Math.PI ;
            const y = amplitude * Math.sin(x) + startY; // Standard mathematical sine curve form; a + b*sin(c (x-d) )
            if (i % 2 === 0) {
                gl.drawCircle(startX + i * 4, y, radius, outlineColor); // optional, precision: number
                gl.drawCircle(startX + i * 4, -y, radius, outlineColor); // optional, precision: number
            } else {
                gl.fillCircle(startX + i * 4, y, radius, fillColor); // optional, precision: number
                gl.fillCircle(startX + i * 4, -y, radius, fillColor); // optional, precision: number
            }
        }

        /** @end-author Nico Klaassen */
    }

    public getForm(formFactory: FormFactory): Form|null {
        return null; // TODO: implement form
    }

    public applySettings(settings: object): void {
        return; // TODO: implement form
    }

    public getName(): string {
        return 'OpenGL Demo Tree';
    }
}
