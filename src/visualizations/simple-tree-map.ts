import {Visualizer} from '../interfaces/visualizer';
import {Node} from '../models/node';
import {OpenGL} from '../opengl/opengl';

export class SimpleTreeMap implements Visualizer {
    private gl: OpenGL;
    private size: number;
    private colorA: number[];
    private colorB: number[];
    private colorDifference: number[];
    private totalNodes: number;
    private offset: number;

    /** @author Nico Klaassen */
    public draw(tree: Node, gl: OpenGL) {
        // Call the recursive draw method
        this.gl = gl;
        this.size = 600;
        const bounds = {
            left: -300,
            right: 300,
            bottom: -300,
            top: 300
        };
        this.colorA = [255 / 255, 153 / 255, 0, 1];
        this.colorB = [51 / 255, 0, 255 / 255, 1];
        this.colorDifference = [
            this.colorB[0] - this.colorA[0],
            this.colorB[1] - this.colorA[1],
            this.colorB[2] - this.colorA[2],
            this.colorB[3] - this.colorA[3]
        ];
        this.totalNodes = tree.subTreeSize;
        this.offset = 2; // TODO: implement as parameter

        this.drawTree(tree, bounds,'HORIZONTAL', false, this.colorB);
    }

    private drawTree(tree: Node, bounds, orientation: string, internalNode: boolean, color: number[]) : void {
        let doneSize = 0;

        let width = Math.abs(bounds.right - bounds.left);
        let height = Math.abs(bounds.top - bounds.bottom);

        // TODO: fix performance issues related to drawing BOTH a fill ánd outline
        // this.gl.fillLinedAAQuad(bounds.left, bounds.bottom, width, height, [1, 0, 0, 1], [0, 0, 0, 1]);
        this.gl.fillLinedAAQuad(bounds.left, bounds.bottom, width, height, color, [0, 0, 0, 1]);
        // this.gl.drawAAQuad(bounds.left, bounds.bottom, width, height, [0, 0, 0, 1]);

        var childOrientation = '';
        // console.log(orientation, (orientation==='HORIZONTAL'));
        if (orientation === 'HORIZONTAL') {
            var childOrientation = 'VERTICAL';
        } else {
            var childOrientation = 'HORIZONTAL';
        }

        console.log(this.colorDifference);
        if (true) {
            // console.log(tree);
            for (let i = 0; i < tree.children.length; i++) {
                const childNode = tree.children[i];
                const childBounds = this.setBounds(bounds, doneSize, tree.subTreeSize, childNode.subTreeSize, orientation);
                doneSize = doneSize + childNode.subTreeSize;
                const childColor = [
                    this.colorA[0] + this.colorDifference[0] * (childNode.subTreeSize / this.totalNodes),
                    this.colorA[1] + this.colorDifference[1] * (childNode.subTreeSize / this.totalNodes),
                    this.colorA[2] + this.colorDifference[2] * (childNode.subTreeSize / this.totalNodes),
                    this.colorA[3] + this.colorDifference[3] * (childNode.subTreeSize / this.totalNodes)
            ];
                console.log(childColor);
                this.drawTree(childNode, childBounds, childOrientation, true, childColor);
            }
        }
    }

    private setBounds(parentBounds, doneSize: number, parentSize: number, childSize: number, parentOrientation: string) {
        // TODO: support offset
        let left = parentBounds.left;
        let right = parentBounds.right;
        let bottom = parentBounds.bottom;
        let top = parentBounds.top;

        const parentWidth = Math.abs(parentBounds.right - parentBounds.left);
        const parentHeight = Math.abs(parentBounds.top - parentBounds.bottom);

        if (parentOrientation === 'HORIZONTAL') {
            left = parentBounds.left + parentWidth * doneSize / parentSize;
            right = parentBounds.left + parentWidth * doneSize / parentSize + parentWidth * childSize / parentSize;
        } else {
            bottom = parentBounds.top - parentHeight * (childSize + doneSize) / parentSize;
            top = parentBounds.top - parentHeight * doneSize / parentSize;
        }

        const newBounds = {
            left: left,
            right: right,
            bottom: bottom,
            top: top
        }

        return newBounds;
    }
    /** @end-author Nico Klaassen */


    public getName(): string {
        return 'Simple Tree Map';
    }
}
