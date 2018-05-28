import {WindowComponent} from '../components/window/window.component';
import {Draw} from '../interfaces/draw';
import {DrawType} from '../enums/draw-type';
import {AaQuadOptions} from '../interfaces/aa-quad-options';
import {Node} from '../models/node';
import {RotatedQuadOptions} from '../interfaces/rotated-quad-options';
import {CircleOptions} from '../interfaces/circle-options';
import {CircleSliceOptions} from '../interfaces/circle-slice-options';
import {RingSliceOptions} from '../interfaces/ring-slice-options';
import {EllipsoidOptions} from '../interfaces/ellipsoid-options';

/** @author Bart Wesselink */
export class InteractionHandler {
    public determineElement(tree: Node, draws: Draw[], coords: number[]): Node|null {
        const x: number = coords[0];
        const y: number = coords[1];

        if (draws == null) {
            return null;
        }

        for (let i = draws.length - 1; i >= 0; i--) {
            const draw: Draw = draws[i];

            if (this.withinDraw(draw, x, y)) {
                const node = this.findNodeByIdentifier(tree, draw.identifier);

                return node;
            }
        }

        return null;
    }

    public fetchDrawByNode(draws: Draw[], node: Node): Draw|null {
        for (let i = draws.length - 1; i >= 0; i--) {
            if (draws[i].identifier === node.identifier) {
                return draws[i];
            }
        }

        return null;
    }

    public withinDraw(draw: Draw, x: number, y: number): boolean {
        let options, distance, x1, y1, x2, y2;
        const degreeToRadianMultiplier = Math.PI / 180;

        switch (draw.type) {
            case DrawType.DRAW_ROTATED_QUAD:
            case DrawType.FILL_ROTATED_QUAD:
            case DrawType.FILL_LINED_ROTATED_QUAD:
                options = draw.options as RotatedQuadOptions;

                const rotation = options.rotation;

                const xCenter = options.x;
                const yCenter = options.y;

                /** @see https://stackoverflow.com/questions/16667961/check-if-point-is-inside-a-rotated-rectangle-with-different-rectangle-origins */
                let c: number = Math.cos(-rotation * degreeToRadianMultiplier);
                let s: number = Math.sin(-rotation * degreeToRadianMultiplier);

                x1  = xCenter;
                y1  = yCenter;
                let w: number  = options.width;
                let h: number  = options.height;

                let rotX: number = x + c * (xCenter - x1) - s * (yCenter - y1);
                let rotY: number = y + s * (xCenter - x1) + c * (yCenter - y1);

                let lx: number = x1 - w / 2;
                let rx: number = x1 + w / 2;
                let ty = y1 - h / 2;
                let by: number = y1 + h / 2;

                return lx <= rotX && rotX <= rx && ty <= rotY && rotY <= by;
                /** @end-see*/
            case DrawType.DRAW_AA_QUAD:
            case DrawType.FILL_AA_QUAD:
            case DrawType.FILL_LINED_AA_QUAD:
                options = draw.options as AaQuadOptions;

                x1 = options.x;
                y1 = options.y;
                x2 = options.x + options.width;
                y2 = options.y + options.height;

                return (
                    x >= x1 &&
                    y >= y1 &&
                    x <= x2 &&
                    y <= y2
                );
            case DrawType.DRAW_CIRCLE:
            case DrawType.FILL_CIRCLE:
            case DrawType.FILL_LINED_CIRCLE:
                options = draw.options as CircleOptions;

                x1 = options.x;
                y1 = options.y;

                x2 = x;
                y2 = y;

                const xDist = Math.abs(x1 - x2);
                const yDist = Math.abs(y1 - y2);

                distance = Math.sqrt(xDist * xDist + yDist * yDist);

                return distance < options.radius;
            case DrawType.DRAW_ELLIPSOID:
            case DrawType.FILL_ELLIPSOID:
            case DrawType.FILL_LINED_ELLIPSOID:
                options = draw.options as EllipsoidOptions;

                x1 = options.x;
                y1 = options.y;

                const contraRotation = options.rotation; // rotation formula takes care of rotation
                const contraRotationInRadians = contraRotation * (Math.PI / 180);

                // rotate the cursor in opposite rotation
                // @see https://stackoverflow.com/questions/17410809/how-to-calculate-rotation-in-2d-in-javascript
                let transformedX = (Math.cos(contraRotationInRadians) * (x - x1)) + (Math.sin(contraRotationInRadians) * (y - y1)) + x1;
                let transformedY = (Math.cos(contraRotationInRadians) * (y - y1)) - (Math.sin(contraRotationInRadians) * (x - x1)) + y1;

                let equation = (Math.pow(transformedX - x1, 2)/Math.pow(options.radx, 2) + Math.pow(transformedY - y1, 2)/Math.pow(options.rady, 2)); // should be <= 1

                return equation <=  1;
            case DrawType.DRAW_CIRCLE_SLICE:
            case DrawType.FILL_CIRCLE_SLICE:
            case DrawType.FILL_LINED_CIRCLE_SLICE:
            case DrawType.DRAW_RING_SLICE:
            case DrawType.FILL_RING_SLICE:
            case DrawType.FILL_LINED_RING_SLICE:
                let outerRadius;
                let innerRadius;

                if (draw.type === DrawType.DRAW_RING_SLICE || draw.type === DrawType.FILL_RING_SLICE || draw.type === DrawType.FILL_LINED_RING_SLICE) {
                    options = draw.options as RingSliceOptions;

                    outerRadius = options.radius;
                    innerRadius = options.near;
                } else {
                    options = draw.options as CircleSliceOptions;

                    outerRadius = options.radius;
                    innerRadius = 0;
                }

                x1 = options.x;
                y1 = options.y;

                let start = this.normalizeAngle(options.start);
                let end = this.normalizeAngle(options.end);

                distance = Math.sqrt(Math.pow(x1 - x, 2) + Math.pow(y1 - y, 2));

                if (distance > outerRadius || distance < innerRadius) {
                    return false;
                }

                let normalizedCursorVectorX = (x1 - x) / distance;
                let normalizedCursorVectorY = (y1 - y) / distance;

                let horizontalUnitVectorX = 1;
                let horizontalUnitVectorY = 0;

                const angle = Math.atan2(normalizedCursorVectorY, normalizedCursorVectorX) * 180 / Math.PI + 180;

                return angle >= start && angle <= end;
        }

        return false;
    }

    private findNodeByIdentifier(tree: Node, identifier: number): Node|null {
        if (tree.identifier === identifier) {
            return tree;
        }

        for (const child of tree.children) {
            const node = this.findNodeByIdentifier(child, identifier);

            if (node !== null) {
                return node;
            }
        }

        return null;
    }

    private normalizeAngle(angle: number) {
        if (angle < 0) {
            angle = 360 + angle;
        }

        return angle % 360;
    }
}
/** @end-author Bart Wesselink */
