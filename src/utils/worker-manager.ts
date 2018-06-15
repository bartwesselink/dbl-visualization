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

                    draw.glid = this.gl.fillRotatedQuad(options.x, options.y, options.width, options.height, options.rotation, options.color);
                    break;
                case DrawType.DRAW_ROTATED_QUAD:
                    options = draw.options as RotatedQuadOptions;

                    draw.glid = this.gl.drawRotatedQuad(options.x, options.y, options.width, options.height, options.rotation, options.color);
                    break;
                case DrawType.FILL_LINED_ROTATED_QUAD:
                    options = draw.options as RotatedQuadOptions;

                    draw.glid = this.gl.fillLinedRotatedQuad(options.x, options.y, options.width, options.height, options.rotation, options.fillColor, options.lineColor);
                    break;
                case DrawType.FILL_AA_QUAD:
                    options = draw.options as AaQuadOptions;

                    draw.glid = this.gl.fillAAQuad(options.x, options.y, options.width, options.height, options.color);
                    break;
                case DrawType.DRAW_AA_QUAD:
                    options = draw.options as AaQuadOptions;

                    draw.glid = this.gl.drawAAQuad(options.x, options.y, options.width, options.height, options.color);
                    break;
                case DrawType.FILL_LINED_AA_QUAD:
                    options = draw.options as AaQuadOptions;

                    draw.glid = this.gl.fillLinedAAQuad(options.x, options.y, options.width, options.height, options.fillColor, options.lineColor);
                    break;
                case DrawType.FILL_ELLIPSOID:
                    options = draw.options as EllipsoidOptions;

                    draw.glid = this.gl.fillEllipsoid(options.x, options.y, options.radx, options.rady, options.rotation, options.color);
                    break;
                case DrawType.DRAW_ELLIPSOID:
                    options = draw.options as EllipsoidOptions;

                    draw.glid = this.gl.drawEllipsoid(options.x, options.y, options.radx, options.rady, options.rotation, options.color);
                    break;
                case DrawType.FILL_LINED_ELLIPSOID:
                    options = draw.options as EllipsoidOptions;

                    draw.glid = this.gl.fillLinedEllipsoid(options.x, options.y, options.radx, options.rady, options.rotation, options.fillColor, options.lineColor);
                    break;
                case DrawType.FILL_CIRCLE:
                    options = draw.options as CircleOptions;

                    draw.glid = this.gl.fillCircle(options.x, options.y, options.radius, options.color);
                    break;
                case DrawType.DRAW_CIRCLE:
                    options = draw.options as CircleOptions;

                    draw.glid = this.gl.drawCircle(options.x, options.y, options.radius, options.color);
                    break;
                case DrawType.FILL_LINED_CIRCLE:
                    options = draw.options as CircleOptions;

                    draw.glid = this.gl.fillLinedCircle(options.x, options.y, options.radius, options.fillColor, options.lineColor);
                    break;
                case DrawType.DRAW_ELLIPSOIDAL_ARC:
                    options = draw.options as ArcOptions;

                    draw.glid = this.gl.drawEllipsoidalArc(options.x, options.y, options.radx, options.rady, options.start, options.end, options.color);
                    break;
                case DrawType.DRAW_CIRCULAR_ARC:
                    options = draw.options as ArcOptions;

                    draw.glid = this.gl.drawCircularArc(options.x, options.y, options.radius, options.start, options.end, options.color);
                    break;
                case DrawType.DRAW_LINE:
                    options = draw.options as LineOptions;

                    draw.glid = this.gl.drawLine(options.x1, options.y1, options.x2, options.y2, options.color);
                    break;
                case DrawType.DRAW_POLY_LINE:
                    options = draw.options as LineOptions;

                    draw.glid = this.gl.drawPolyLine(options.x, options.y, options.color);
                    break;
                case DrawType.FILL_RING_SLICE:
                    options = draw.options as RingSliceOptions;

                    draw.glid = this.gl.fillRingSlice(options.x, options.y, options.near, options.far, options.start, options.end, options.color);
                    break;
                case DrawType.DRAW_RING_SLICE:
                    options = draw.options as RingSliceOptions;

                    draw.glid = this.gl.drawRingSlice(options.x, options.y, options.near, options.far, options.start, options.end, options.color);
                    break;
                case DrawType.FILL_LINED_RING_SLICE:
                    options = draw.options as RingSliceOptions;

                    draw.glid = this.gl.fillLinedRingSlice(options.x, options.y, options.near, options.far, options.start, options.end, options.fillColor, options.lineColor);
                    break;
                case DrawType.FILL_CIRCLE_SLICE:
                    options = draw.options as CircleSliceOptions;

                    draw.glid = this.gl.fillCircleSlice(options.x, options.y, options.radius, options.start, options.end, options.color);
                    break;
                case DrawType.DRAW_CIRCLE_SLICE:
                    options = draw.options as CircleSliceOptions;

                    draw.glid = this.gl.drawCircleSlice(options.x, options.y, options.radius, options.start, options.end, options.color);
                    break;
                case DrawType.FILL_LINED_CIRCLE_SLICE:
                    options = draw.options as CircleSliceOptions;

                    draw.glid = this.gl.fillLinedCircleSlice(options.x, options.y, options.radius, options.start, options.end, options.fillColor, options.lineColor);
                    break;
            }
        }
    }
    /** @end-author Bart Wesselink */
}