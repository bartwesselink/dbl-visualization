import {Draw} from '../interfaces/draw';
import {DrawType} from '../enums/draw-type';
import {AaQuadOptions} from '../interfaces/aa-quad-options';
import {Node} from '../models/node';
import {RotatedQuadOptions} from '../interfaces/rotated-quad-options';
import {CircleOptions} from '../interfaces/circle-options';
import {CircleSliceOptions} from '../interfaces/circle-slice-options';
import {RingSliceOptions} from '../interfaces/ring-slice-options';
import {EllipsoidOptions} from '../interfaces/ellipsoid-options';
import {OpenGL} from '../opengl/opengl';
import {ElementRef} from '@angular/core';
import {Matrix} from '../opengl/matrix';
import {InteractionOptions} from "../enums/interaction-options";

/** @author Bart Wesselink */
export class InteractionHandler {
    private readonly ZOOM_FOCUS_FACTOR = 6;

    public determineElement(tree: Node, draws: Draw[], coords: number[]): Node|null {
        const x: number = coords[0];
        const y: number = coords[1];

        if (draws == null) {
            return null;
        }

        for (let i = draws.length - 1; i >= 0; i--) {
            const draw: Draw = draws[i];

            if (draw.identifier != undefined && this.withinDraw(draw, x, y)) {
                return this.findNodeByIdentifier(tree, draw.identifier);
            }
        }

        return null;
    }

    public fetchDrawByNode(draws: Draw[], node: Node): Draw|null {
        return draws[node.identifier];
    }

    public withinDraw(draw: Draw, x: number, y: number): boolean {
        let options, distance, x1, y1, x2, y2, contraRotation, transformed, transformedX, transformedY;
        const degreeToRadianMultiplier = Math.PI / 180;

        switch (draw.type) {
            case DrawType.DRAW_ROTATED_QUAD:
            case DrawType.FILL_ROTATED_QUAD:
            case DrawType.FILL_LINED_ROTATED_QUAD:
                options = draw.options as RotatedQuadOptions;

                let centerX = options.x;
                let centerY = options.y;

                contraRotation = -options.rotation;

                // rotate the cursor in opposite rotation
                transformed = Matrix.rotateVector2D([centerX, centerY], [x, y], contraRotation);
                transformedX = transformed[0];
                transformedY = transformed[1];

                x1 = options.x - options.width / 2;
                y1 = options.y - options.height / 2;
                x2 = options.x + options.width / 2;
                y2 = options.y + options.height / 2;

                return (
                    transformedX >= x1 &&
                    transformedY >= y1 &&
                    transformedX <= x2 &&
                    transformedY <= y2
                );
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

                contraRotation = -options.rotation;

                // rotate the cursor in opposite rotation
                transformed = Matrix.rotateVector2D([x1, y1], [x, y], contraRotation);
                transformedX = transformed[0];
                transformedY = transformed[1];

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

                    outerRadius = options.far;
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

    public scaleToNode(gl: OpenGL, canvas: ElementRef, currentDraws: Draw[], node: Node, interactionOptions: InteractionOptions): void {
        if (interactionOptions === InteractionOptions.Nothing) return;

        const draw: Draw = this.fetchDrawByNode(currentDraws, node);

        if (draw != null) {
            gl.resetTranslation();

            let x, y;

            if (draw.type === DrawType.DRAW_AA_QUAD || draw.type === DrawType.FILL_AA_QUAD || draw.type === DrawType.FILL_LINED_AA_QUAD) {
                const options: AaQuadOptions = draw.options as AaQuadOptions;

                // x,y are not centered, but in bottom-left corner
                x = options.x + options.width / 2;
                y = options.y + options.height / 2;
            } else {
                x = draw.options.x;
                y = draw.options.y;
            }

            enum Orientation {
                WIDTH,
                HEIGHT,
            }

            let size, width, height;
            let orientation: Orientation;

            const glWidth = gl.getWidth();
            const glHeight = gl.getHeight();

            switch (draw.type) {
                case DrawType.FILL_LINED_ROTATED_QUAD:
                case DrawType.DRAW_ROTATED_QUAD:
                case DrawType.FILL_ROTATED_QUAD:
                case DrawType.FILL_LINED_AA_QUAD:
                case DrawType.DRAW_AA_QUAD:
                case DrawType.FILL_AA_QUAD:
                    width = (draw.options as RotatedQuadOptions).width;
                    height = (draw.options as RotatedQuadOptions).height;

                    if (height > width) {
                        orientation = Orientation.HEIGHT;
                        size = height;
                    } else {
                        orientation = Orientation.WIDTH;
                        size = width;
                    }

                    break;
                case DrawType.FILL_LINED_CIRCLE:
                case DrawType.DRAW_CIRCLE:
                case DrawType.FILL_CIRCLE:
                case DrawType.FILL_LINED_CIRCLE_SLICE:
                case DrawType.DRAW_CIRCLE_SLICE:
                case DrawType.FILL_CIRCLE_SLICE:
                    size = (draw.options as CircleOptions).radius * 2;

                    if (glWidth > glHeight) {
                        orientation = Orientation.HEIGHT;
                    } else {
                        orientation = Orientation.WIDTH;
                    }

                    break;
                case DrawType.FILL_LINED_RING_SLICE:
                case DrawType.DRAW_RING_SLICE:
                case DrawType.FILL_RING_SLICE:
                    let ringSliceOptions = draw.options as RingSliceOptions;

                    let startAngle = ringSliceOptions.start;
                    let endAngle = ringSliceOptions.end;

                    let radius = ringSliceOptions.far;
                    let innerRadius = ringSliceOptions.near;
                    let angleDifference = endAngle - startAngle;
                    let halfAngle = angleDifference / 2 + startAngle;

                    let startX = Math.cos(startAngle * (Math.PI / 180)) * radius;
                    let startY = Math.sin(startAngle * (Math.PI / 180)) * radius;
                    let endX = Math.cos(endAngle * (Math.PI / 180)) * radius;
                    let endY = Math.sin(endAngle * (Math.PI / 180)) * radius;

                    x = Math.cos(halfAngle * (Math.PI / 180)) * innerRadius;
                    y = Math.sin(halfAngle * (Math.PI / 180)) * innerRadius;

                    size = 2 * Math.PI * radius * (1 / 360) * angleDifference; // not entirely correct but gives a reasonable estimation

                    if (glWidth > glHeight) {
                        orientation = Orientation.HEIGHT;
                    } else {
                        orientation = Orientation.WIDTH;
                    }

                    break;
                case DrawType.FILL_LINED_ELLIPSOID:
                case DrawType.DRAW_ELLIPSOID:
                case DrawType.FILL_ELLIPSOID:
                    width = (draw.options as EllipsoidOptions).radx;
                    height = (draw.options as EllipsoidOptions).rady;

                    if (height > width) {
                        orientation = Orientation.HEIGHT;
                        size = height;
                    } else {
                        orientation = Orientation.WIDTH;
                        size = width;
                    }

                    break;
            }

            gl.glTranslate(-x, -y);

            if (interactionOptions === InteractionOptions.ZoomAndPan) {
                let zoomFactor;

                if (orientation === Orientation.WIDTH) {
                    zoomFactor = glWidth / (size * this.ZOOM_FOCUS_FACTOR);
                } else {
                    zoomFactor = glHeight / (size * this.ZOOM_FOCUS_FACTOR);
                }

                gl.scale(zoomFactor);
            }
        }
    }

    private normalizeAngle(angle: number) {
        if (angle < 0) {
            angle = 360 + angle;
        }

        return angle !== 0 && angle % 360 === 0 ? 360 : angle % 360;
    }
}
/** @end-author Bart Wesselink */
