import {Visualizer} from '../interfaces/visualizer';
import {Node} from '../models/node';
import {OpenGL} from '../opengl/opengl';

export class GeneralizedPythagorasTree implements Visualizer {
    public draw(tree: Node, gl: OpenGL) {
        /** @author Roan Hofland */
        //test visualisations
		/*
        gl.drawAAQuad(0,    0,    100, 100, [1, 0, 0, 1]);
        gl.drawAAQuad(-100, -100, 100, 100, [0, 1, 0, 1]);
        gl.drawAAQuad(0,    -300, 200, 200, [0, 0, 1, 1]);

        for(var i = 0; i <= 36; i++){
            gl.drawRotatedQuad(-800 + 25 + 43 * i, 200, 35, 35, i * 10, [1, 0, 0, 1]);
        }
        for(var i = 0; i <= 18; i++){
            gl.drawRotatedQuad(-800 + 25 + 86 * i, 300, 70, 35, i * 20, [1, 0, 0, 1]);
        }


        //scalability hell test (change the limit)
        for(var i = 0; i < 5; i++){
            //recall that our viewport is fixed at 1600x900, but we will never need this fact except for this test case since visualisations can go beyond the viewport
            var x = (Math.random() - 0.5) * 1600;
            var y = (Math.random() - 0.5) * 900;
            gl.drawAAQuad(x, y, 50, 50, [Math.random(), Math.random(), Math.random(), Math.random()]);
        }*/
        /** @end-author Roan Hofland */
		let rectangle = [-200, -200, 30, 30, 0];
		this.generate(tree, rectangle, gl);
    }

    public getName(): string {
        return 'Generalized Pythagoras Tree';
    }

	  weightHeight = 1; // Scaling factor for the height of every rectangle that is not the root
  color = [1,0,1,1]; // Just some test color

  private generate(tree: Node, rectangle: number[], gl: OpenGL): void {
    // Rectangle is an array of 5 numbers, in order: center x, center y, width (X), height (Y), angle
    gl.drawRotatedQuad(rectangle[0], rectangle[1], rectangle[2], rectangle[3], rectangle[4], this.color);
    /** This function can be considered in two ways. The first way is as it's done here. We loop over all the children
     * of a node and consider what part this child is of the parent. Thus the child calculates what relative size it is
     * of the parent. The second way is to take the parent and calculate the relative size of each of its children.
     * Using the first way we can immediately recurse on the element we are considering, using the second way we need to
     * recurse on the children of the element we are considering.
     */
    if (tree.children) { // If a node does not have children it does not have to draw its children
      let angle: Array<number> = [];
      for (let element of tree.children) {
        angle.push(Math.PI * (element.getSizeSubTree() / element.getParent().getSizeSubTree())); // Calculate the angle of every subtree
        let width = rectangle[2] * Math.sin(angle[angle.length - 1] / 2); // The last value in the array is always the one calculated last
        let height = this.weightHeight * rectangle[3] * Math.sin(angle[angle.length - 1] / 2);
        let center = this.calculateCenter(rectangle[2], width, height, angle, rectangle[4]);
        center = [center[0] + rectangle[0], center[1] + rectangle[1]]
        let rotation = this.calculateRotation(angle, rectangle[4]);
        let rectangleChild = [center[0], center[1], width, height, rotation];
        this.generate(element, rectangleChild, gl);
      }
    }
  }

  private calculateCenter(widthPrevious: number, width: number, height: number, newAngle: number[], oldAngle: number): number[] {

    // The coordinates of the new rectangle, bottom right refers to the first corner of the rectangle on the circle going counter clockwise
    let bottomRight = [(widthPrevious/2) * Math.cos(newAngle[newAngle.length - 2]), (widthPrevious/2) * Math.sin(newAngle[newAngle.length - 2])];
    let bottomLeft = [(widthPrevious/2) * Math.cos(newAngle[newAngle.length - 1]), (widthPrevious/2) * Math.sin(newAngle[newAngle.length - 1])];

    // The mid point between the two corners calculated previously, relative to the previous rectangle
    let middle = [(bottomLeft[0] + bottomRight[0])/2, (bottomLeft[1] + bottomRight[1])/2];

    // This is the angle between the two lines going to the corners of the new rectangle
    let angle = newAngle[newAngle.length - 1] - newAngle[newAngle.length - 2];

    // The center coordinates of the new rectangle
    let centerX = (width / 2) * Math.cos((angle/2) + oldAngle) + middle[0];
    let centerY = (height / 2) * Math.sin((angle/2) + oldAngle) + middle[1];

    return [centerX, centerY];
  }

  private calculateRotation(newAngle: number[], oldAngle: number): number {
    let angle = newAngle[newAngle.length - 1] - newAngle[newAngle.length - 2];
    angle += oldAngle;
    return angle;
  }


}
