import {Visualizer} from '../interfaces/visualizer';
import {Node} from '../models/node';
import {OpenGL} from '../opengl/opengl';

export class SimpleTreeMap implements Visualizer {
    private gl: OpenGL;
    private size: number;

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
        this.drawTree(tree, bounds,'HORIZONTAL', false);
    }

    private drawTree(tree: Node, bounds, orientation: string, internalNode: boolean) : void {
        let doneSize = 0;

        let width = Math.abs(bounds.right - bounds.left);
        let height = Math.abs(bounds.top - bounds.bottom);
        this.gl.fillLinedAAQuad(bounds.left, bounds.bottom, width, height, [1, 0, 0, 0.2], [0, 0, 0, 1]);
        var childOrientation = '';
        console.log(orientation, (orientation==='HORIZONTAL'));
        if (orientation === 'HORIZONTAL') {
            var childOrientation = 'VERTICAL';
        } else {
            var childOrientation = 'HORIZONTAL';
        }

        if (true) {
            // console.log(tree);
            for (let i = 0; i < tree.children.length; i++) {
                const childNode = tree.children[i];
                const childBounds = this.setBounds(bounds, doneSize, tree.subTreeSize, childNode.subTreeSize, orientation);
                doneSize = doneSize + childNode.subTreeSize;
                this.drawTree(childNode, childBounds, childOrientation, true)
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
