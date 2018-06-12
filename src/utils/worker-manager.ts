import {WebWorkerService} from 'angular2-web-worker';
import {Injectable} from '@angular/core';
import {Draw} from '../interfaces/draw';
import {OpenGL} from '../opengl/opengl';
import {RotatedQuadOptions} from '../interfaces/rotated-quad-options';
import {AaQuadOptions} from '../interfaces/aa-quad-options';
import {EllipsoidOptions} from '../interfaces/ellipsoid-options';
import {CircleOptions} from '../interfaces/circle-options';
import {VisualizerInput} from '../interfaces/visualizer-input';
import {ArcOptions} from '../interfaces/arc-options';
import {LineOptions} from '../interfaces/line-options';
import {RingSliceOptions} from '../interfaces/ring-slice-options';
import {CircleSliceOptions} from '../interfaces/circle-slice-options';
import {CustomQuadOptions} from "../interfaces/custom-quad-options";
import {DrawType} from '../enums/draw-type';

@Injectable()
export class WorkerManager {
    /** @author Bart Wesselink */
    private gl: OpenGL;
    constructor (private webWorkerService: WebWorkerService) {
    }

    public startWorker(gl: OpenGL, fn: (input: VisualizerInput) => Draw[], input: VisualizerInput): Promise<Draw[]> {
        return new Promise((resolve, reject) => {
            this.gl = gl;

            let worker = this.webWorkerService.run(fn, input)
                .then((draws: Draw[]) => {
                    this.drawItems(draws);

                    resolve(draws);
                })
                .catch((error) => console.log(error));
        });
    }

    private drawItems(draws: Draw[]): void {
        if (!this.gl) throw new Error('No OpenGL context specified.');

        let options: any;

        for (const draw of draws) {
            // Cannot use enums here, because they are not available on the separate thread :/
            switch (draw.type) {
                case DrawType.FILL_ROTATED_QUAD:
                    options = draw.options as RotatedQuadOptions;

                    this.gl.fillRotatedQuad(options.x, options.y, options.width, options.height, options.rotation, options.color);
                    break;
                case DrawType.DRAW_ROTATED_QUAD:
                    options = draw.options as RotatedQuadOptions;

                    this.gl.drawRotatedQuad(options.x, options.y, options.width, options.height, options.rotation, options.color);
                    break;
                case DrawType.FILL_LINED_ROTATED_QUAD:
                    options = draw.options as RotatedQuadOptions;

                    this.gl.fillLinedRotatedQuad(options.x, options.y, options.width, options.height, options.rotation, options.fillColor, options.lineColor);
                    break;
                case DrawType.FILL_AA_QUAD:
                    options = draw.options as AaQuadOptions;

                    this.gl.fillAAQuad(options.x, options.y, options.width, options.height, options.color);
                    break;
                case DrawType.DRAW_AA_QUAD:
                    options = draw.options as AaQuadOptions;

                    this.gl.drawAAQuad(options.x, options.y, options.width, options.height, options.color);
                    break;
                case DrawType.FILL_LINED_AA_QUAD:
                    options = draw.options as AaQuadOptions;

                    this.gl.fillLinedAAQuad(options.x, options.y, options.width, options.height, options.fillColor, options.lineColor);
                    break;
                case DrawType.FILL_ELLIPSOID:
                    options = draw.options as EllipsoidOptions;

                    this.gl.fillEllipsoid(options.x, options.y, options.radx, options.rady, options.rotation, options.color);
                    break;
                case DrawType.DRAW_ELLIPSOID:
                    options = draw.options as EllipsoidOptions;

                    this.gl.drawEllipsoid(options.x, options.y, options.radx, options.rady, options.rotation, options.color);
                    break;
                case DrawType.FILL_LINED_ELLIPSOID:
                    options = draw.options as EllipsoidOptions;

                    this.gl.fillLinedEllipsoid(options.x, options.y, options.radx, options.rady, options.rotation, options.fillColor, options.lineColor);
                    break;
                case DrawType.FILL_CIRCLE:
                    options = draw.options as CircleOptions;

                    this.gl.fillCircle(options.x, options.y, options.radius, options.color);
                    break;
                case DrawType.DRAW_CIRCLE:
                    options = draw.options as CircleOptions;

                    this.gl.drawCircle(options.x, options.y, options.radius, options.color);
                    break;
                case DrawType.FILL_LINED_CIRCLE:
                    options = draw.options as CircleOptions;

                    this.gl.fillLinedCircle(options.x, options.y, options.radius, options.fillColor, options.lineColor);
                    break;
                case DrawType.DRAW_ELLIPSOIDAL_ARC:
                    options = draw.options as ArcOptions;

                    this.gl.drawEllipsoidalArc(options.x, options.y, options.radx, options.rady, options.start, options.end, options.color);
                    break;
                case DrawType.DRAW_CIRCULAR_ARC:
                    options = draw.options as ArcOptions;

                    this.gl.drawCircularArc(options.x, options.y, options.radius, options.start, options.end, options.color);
                    break;
                case DrawType.DRAW_LINE:
                    options = draw.options as LineOptions;

                    this.gl.drawLine(options.x1, options.y1, options.x2, options.y2, options.color);
                    break;
                case DrawType.DRAW_POLY_LINE:
                    options = draw.options as LineOptions;

                    this.gl.drawPolyLine(options.x, options.y, options.color);
                    break;
                case DrawType.FILL_RING_SLICE:
                    options = draw.options as RingSliceOptions;

                    this.gl.fillRingSlice(options.x, options.y, options.near, options.far, options.start, options.end, options.color);
                    break;
                case DrawType.DRAW_RING_SLICE:
                    options = draw.options as RingSliceOptions;

                    this.gl.drawRingSlice(options.x, options.y, options.near, options.far, options.start, options.end, options.color);
                    break;
                case DrawType.FILL_LINED_RING_SLICE:
                    options = draw.options as RingSliceOptions;

                    this.gl.fillLinedRingSlice(options.x, options.y, options.near, options.far, options.start, options.end, options.fillColor, options.lineColor);
                    break;
                case DrawType.FILL_CIRCLE_SLICE:
                    options = draw.options as CircleSliceOptions;

                    this.gl.fillCircleSlice(options.x, options.y, options.radius, options.start, options.end, options.color);
                    break;
                case DrawType.DRAW_CIRCLE_SLICE:
                    options = draw.options as CircleSliceOptions;

                    this.gl.drawCircleSlice(options.x, options.y, options.radius, options.start, options.end, options.color);
                    break;
                case DrawType.FILL_LINED_CIRCLE_SLICE:
                    options = draw.options as CircleSliceOptions;

                    this.gl.fillLinedCircleSlice(options.x, options.y, options.radius, options.start, options.end, options.fillColor, options.lineColor);
                    break;
                case DrawType.FILL_CUSTOM_QUAD:
                    options = draw.options as CustomQuadOptions;

                    this.gl.fillCustomQuad(options.x1, options.y1, options.x2, options.y2, options.x3, options.y3, options.x4, options.y4, options.fillColor);
                    break;
                case DrawType.DRAW_CUSTOM_QUAD:
                    options = draw.options as CustomQuadOptions;

                    this.gl.drawCustomQuad(options.x1, options.y1, options.x2, options.y2, options.x3, options.y3, options.x4, options.y4, options.color);
                    break;
                case DrawType.FILL_LINED_CUSTOM_QUAD:
                    options = draw.options as CustomQuadOptions;

                    this.gl.fillLinedCustomQuad(options.x1, options.y1, options.x2, options.y2, options.x3, options.y3, options.x4, options.y4, options.fillColor, options.lineColor);
                    break;
            }
        }
    }
    /** @end-author Bart Wesselink */
}
