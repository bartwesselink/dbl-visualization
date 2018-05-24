import {Visualizer} from '../interfaces/visualizer';
import {Node} from '../models/node';
import {OpenGL} from '../opengl/opengl';
import {FormFactory} from '../form/form-factory';
import {Form} from "../form/form";
import {Draw} from '../interfaces/draw';
import {VisualizerInput} from '../interfaces/visualizer-input';
import {DrawType} from '../enums/draw-type';

/** @author Nico Klaassen */
export class OpenglDemoTree implements Visualizer {
    public draw(input: VisualizerInput): Draw[] {
        const tree = input.tree;
        let settings = input.settings;

        const mainColor = [
            settings.r / 255,
            settings.g / 255,
            settings.b / 255,
            settings.a / 255
        ];

        const sinewaves: boolean = settings.sinewaves;

        const draws = [];

        // Draw axis - range and domain: [-100, 100]
        draws.push({ type: 4 /** FillAAQuad **/, options: { x: -200, y: -1, width: 400, height: 2, color: [1, 0, 0, 1] } }); // X axis
        draws.push({ type: 4 /** FillAAQuad **/, options: { x: -1, y: -200, width: 2, height: 400, color: [1, 0, 0, 1] } }); // Y axis

        for (let i = 0; i <= 20; i++) {
            const offset = 10 * i;

            draws.push({ type: 4 /** FillAAQuad **/, options: { x: offset, y: -1, width: 2, height: 2, color: [0, 0, 0, 1] } }); // x+ ticks
            draws.push({ type: 4 /** FillAAQuad **/, options: { x: -offset, y: -1, width: 2, height: 2, color: [0, 0, 0, 1] } }); // x- ticks
            draws.push({ type: 4 /** FillAAQuad **/, options: { x: -1, y: offset, width: 2, height: 2, color: [0, 0, 0, 1] } }); // y+ ticks
            draws.push({ type: 4 /** FillAAQuad **/, options: { x: -1, y: -offset, width: 2, height: 2, color: [0, 0, 0, 1] } }); // y- ticks
        }

        // Some big green quad examples
        // Note that the misalignment of the top-left rectangle is intentional to highlight it is being drawn based on
        // an (x, y) center coordinate. Where-as (x, y) is the bottom-left coordinate for the other quads.
        draws.push({ type: 4 /** FillAAQuad **/, options: { x: 100, y: 100, width: 100, height: 100, color: mainColor } });
        draws.push({ type: 5 /** DrawAAQuad **/, options: { x: 100, y: -200, width: 100, height: 100, color: mainColor } });
        draws.push({ type: 6 /** FillLinedAAQuad **/, options: { x: -200, y: -200, width: 100, height: 100, fillColor: mainColor, lineColor: [0, 0, 0, 1] } });
        draws.push({ type: 2 /** DrawRotatedQuad **/, options: { x: -200, y: 100, width: 100, height: 100, rotation: 45, color: mainColor } });

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

            draws.push({ type: 3 /** FillLinedRotatedQuad **/, options: { x: x, y: startY, width: quadWidth, height: quadHeight, rotation: rotationDegrees, fillColor: randomColor, lineColor: outlineColor } });
            draws.push({ type: 9 /** FillLinedEllipsoid **/, options: { x: x, y: -startY, radx: radiusX, rady: radiusY, rotation: rotationDegrees, fillColor: randomColor, lineColor: outlineColor } });
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

            draws.push({ type: 3 /** FillLinedRotatedQuad **/, options: { x: x, y: startY, width: quadWidth, height: quadHeight, rotation: rotationDegrees, fillColor: randomColor, lineColor: outlineColor } });
            draws.push({ type: 9 /** FillLinedEllipsoid **/, options: { x: x, y: startY, radx: radiusX, rady: radiusY, rotation: rotationDegrees, fillColor: randomColor, lineColor: outlineColor } });
        }

        if (sinewaves) {
            // Sine wave example
            startX = -720;
            startY = 30;
            let amplitude = 10;
            let radius = 2;
            let fillColor = [1, 0, 0, 1];
            outlineColor = [0, 0, 0, 1];

            for (let i = 0; i <= 360; i++) {
                const x = i / Math.PI;
                const y = amplitude * Math.sin(x) + startY; // Standard mathematical sine curve form; a + b*sin(c (x-d) )
                if (i % 2 === 0) {
                    draws.push({ type: 11 /** DrawCircle **/, options: { x: startX + i * 4, y: y, radius: radius, color: outlineColor } });
                    draws.push({ type: 11 /** DrawCircle **/, options: { x: startX + i * 4, y: -y, radius: radius, color: outlineColor } });
                } else {
                    draws.push({ type: 10 /** FillCircle **/, options: { x: startX + i * 4, y: y, radius: radius, color: fillColor } });
                    draws.push({ type: 10 /** FillCircle **/, options: { x: startX + i * 4, y: -y, radius: radius, color: fillColor } });
                }
            }
        }

        // draw calls for slices
        draws.push({ type: 20 /** DrawCircleSlice **/, options: { x: 500, y: -165, radius: 100, start: 0, end: (360 / 3), color: [1, 0, 0, 1] }});
        draws.push({ type: 21 /** FillCircleSlice **/, options: { x: 500 - 50, y: -165, radius: 100, start: (360 / 3), end: (360 / 3) * 2, color: [1, 0, 0, 1] }});
        draws.push({ type: 22 /** FillLinedCircleSlice **/, options: { x: 500, y: -165, radius: 100, start: (360 / 3) * 2, end: (360 / 3) * 3, fillColor: [1, 0, 0, 1], lineColor: [0, 0, 0, 1] }});

        draws.push({ type: 17 /** DrawRingSlice **/, options: { x: -500, y: -165, near: 50, far: 100, start: 0, end: (360 / 3), color: [1, 0, 0, 1] }});
        draws.push({ type: 18 /** FillRingSlice **/, options: { x: -500, y: -165, near: 75, far: 100, start: (360 / 3), end: (360 / 3) * 2, color: [1, 0, 0, 1] }});
        draws.push({ type: 19 /** FillLinedRingSlice **/, options: { x: -500, y: -165, near: 50, far: 100, start: (360 / 3) * 2, end: (360 / 3) * 3, fillColor: [1, 0, 0, 1], lineColor: [0, 0, 0, 1] }});

        // draw calls for lines
        draws.push({ type: 16 /** DrawPolyLine **/, options: { x: [-500, -200, 0, 200, 500], y: [100, 170, 100, 100, 170], color: [0, 0, 0, 1] } });

        draws.push({ type: 14 /** DrawCircularArc **/, options: { x: 150, y: 100, radius: 50, start: 0, end: 180, color: [0, 0, 0, 1] } });
        draws.push({ type: 13 /** DrawEllipsoidalArc **/, options: { x: 0, y: -100, radx: 100, rady: 30, start: 0, end: 180, color: [0, 0, 0, 1] } });

        return draws;
    }

    public getForm(formFactory: FormFactory) {
        return formFactory.createFormBuilder()
            .addSliderField('r', 0, { label: 'Red', min: 0, max: 255 })
            .addSliderField('g', 255, { label: 'Green', min: 0, max: 255 })
            .addSliderField('b', 0, { label: 'Blue', min: 0, max: 255 })
            .addSliderField('a', 255, { label: 'Alpha', min: 0, max: 255 })
            .addToggleField('sinewaves', true, { label: 'Sine waves' })
            .getForm();
    }

    public getName(): string {
        return 'OpenGL Demo Tree';
    }

    public getThumbnailImage(): string|null {
        return null;
    }
}
/** @end-author Nico Klaassen */
