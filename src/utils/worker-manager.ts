import {WebWorkerService} from 'angular2-web-worker';
import {Injectable} from '@angular/core';
import {Draw} from '../interfaces/draw';
import {OpenGL} from '../opengl/opengl';
import {RotatedQuadOptions} from '../interfaces/rotated-quad-options';
import {AaQuadOptions} from '../interfaces/aa-quad-options';
import {EllipsoidOptions} from '../interfaces/ellipsoid-options';
import {CircleOptions} from '../interfaces/circle-options';
import {VisualizerInput} from '../interfaces/visualizer-input';

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
                case 1:
                    options = draw.options as RotatedQuadOptions;

                    this.gl.fillRotatedQuad(options.x, options.y, options.width, options.height, options.rotation, options.color);
                    break;
                case 2:
                    options = draw.options as RotatedQuadOptions;

                    this.gl.drawRotatedQuad(options.x, options.y, options.width, options.height, options.rotation, options.color);
                    break;
                case 3:
                    options = draw.options as RotatedQuadOptions;

                    this.gl.fillLinedRotatedQuad(options.x, options.y, options.width, options.height, options.rotation, options.fillColor, options.lineColor);
                    break;
                case 4:
                    options = draw.options as AaQuadOptions;

                    this.gl.fillAAQuad(options.x, options.y, options.width, options.height, options.color);
                    break;
                case 5:
                    options = draw.options as AaQuadOptions;

                    this.gl.drawAAQuad(options.x, options.y, options.width, options.height, options.color);
                    break;
                case 6:
                    options = draw.options as AaQuadOptions;

                    this.gl.fillLinedAAQuad(options.x, options.y, options.width, options.height, options.fillColor, options.lineColor);
                    break;
                case 7:
                    options = draw.options as EllipsoidOptions;

                    this.gl.fillEllipsoid(options.x, options.y, options.radx, options.rady, options.rotation, options.color);
                    break;
                case 8:
                    options = draw.options as EllipsoidOptions;

                    this.gl.drawEllipsoid(options.x, options.y, options.radx, options.rady, options.rotation, options.color);
                    break;
                case 9:
                    options = draw.options as EllipsoidOptions;

                    this.gl.fillLinedEllipsoid(options.x, options.y, options.radx, options.rady, options.rotation, options.fillColor, options.lineColor);
                    break;
                case 10:
                    options = draw.options as CircleOptions;

                    this.gl.fillCircle(options.x, options.y, options.radius, options.color);
                    break;
                case 11:
                    options = draw.options as CircleOptions;

                    this.gl.drawCircle(options.x, options.y, options.radius, options.color);
                    break;
                case 12:
                    options = draw.options as CircleOptions;

                    this.gl.fillLinedCircle(options.x, options.y, options.radius, options.fillColor, options.lineColor);
                    break;
            }
        }
    }
    /** @end-author Bart Wesselink */
}