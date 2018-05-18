import {WindowComponent} from '../components/window/window.component';
import {Draw} from '../interfaces/draw';
import {DrawType} from '../enums/draw-type';
import {AaQuadOptions} from '../interfaces/aa-quad-options';
import {Node} from '../models/node';
import {RotatedQuadOptions} from '../interfaces/rotated-quad-options';
import {CircleOptions} from '../interfaces/circle-options';

/** @author Bart Wesselink */
export class InteractionHandler {
    constructor(private windowComponent: WindowComponent) {
    }

    public determineClick(tree: Node, draws: Draw[], coords: number[]) {
        const x: number = coords[0];
        const y: number = coords[1];

        for (let i = draws.length - 1; i >= 0; i--) {
            const draw: Draw = draws[i];

            if (this.withinDraw(draw, x, y)) {
                const node = this.findNodeByIdentifier(tree, draw.identifier);

                if (tree.selectedNode) {
                    tree.selectedNode.selected = false;
                    tree.selectedNode = null;
                }

                tree.selectedNode = node;
                node.selected = true;

                this.windowComponent.redrawAllScenes();

                break;
            }
        }
    }

    public withinDraw(draw: Draw, x: number, y: number): boolean {
        let options, x1, y1, x2, y2;
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

                const distance: number = Math.sqrt(xDist * xDist + yDist * yDist);

                return distance < options.radius;
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
}
/** @end-author Bart Wesselink */
