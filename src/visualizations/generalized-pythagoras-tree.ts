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
		let rectangle = [0, -250, 50, 50, 0];
		this.generate(tree, rectangle, gl);
        // console.log(tree.subTreeSize);
        // for (let element of tree.children){
		 //    console.log(element.subTreeSize);
        // }

		gl.drawRotatedQuad(-300, -300, 40, 40, 30, this.color);
    }

    public getName(): string {
        return 'Generalized Pythagoras Tree';
    }

	  weightHeight = 1; // Scaling factor for the height of every rectangle that is not the root
  color = [1,0,1,0.5]; // Just some test color

  private generate(tree: Node, rectangle: number[], gl: OpenGL): void {
    // Rectangle is an array of 5 numbers, in order: center x, center y, width (X), height (Y), angle
    gl.drawRotatedQuad(rectangle[0], rectangle[1], rectangle[2], rectangle[3], rectangle[4]  * 57.295779513082320876798154814105, this.color);
    /** This function can be considered in two ways. The first way is as it's done here. We loop over all the children
     * of a node and consider what part this child is of the parent. Thus the child calculates what relative size it is
     * of the parent. The second way is to take the parent and calculate the relative size of each of its children.
     * Using the first way we can immediately recurse on the element we are considering, using the second way we need to
     * recurse on the children of the element we are considering.
     */
    if (tree.subTreeSize > 1) { // If a node does not have children it does not have to draw its children
      let angle: Array<number> = [0]; // Initialize to zero helps with calculating using the first angle
        console.log("hello");
      for (let element of tree.children) {
         angle.push(angle[angle.length - 1] + Math.PI * (element.subTreeSize / (element.parent.subTreeSize -1))); // Calculate the angle of every subtree
          console.log(angle);
        //  angle.push(Math.PI * (1 /3));
        let width = rectangle[2] * Math.sin((angle[angle.length - 1] - angle[angle.length - 2])/2); // The last value in the array is always the one calculated last
        let height = this.weightHeight * rectangle[3] * Math.sin((angle[angle.length - 1] - angle[angle.length - 2])/2);
        let center = this.calculateCenter(rectangle[2], rectangle[3], width, height, angle, rectangle[4]);
        center = [center[0] + rectangle[0], center[1] + rectangle[1]];
        //   console.log(center);
        //  center = [center[0], center[1] + rectangle[3]/2];
         //  console.log(center);
        //let rotation = this.calculateRotation(angle, rectangle[4]);
          let rotation = (angle[angle.length - 1] + angle[angle.length - 2])/2 + rectangle[4] - Math.PI/2;
        //   let rotation = (angle[angle.length - 1] + angle[angle.length - 2])/2 + rectangle[4];
        //   let rotation = 0.7853981633974483096156608458198 - Math.PI/2;
          console.log(rotation);
        let rectangleChild = [center[0], center[1], width, height, rotation];
        this.generate(element, rectangleChild, gl);
      }
    }
  }

  private calculateCenter(widthPrevious: number, heightPrevious: number, width: number, height: number, newAngle: number[], oldAngle: number): number[] {

      // if (newAngle.length < 2) {
      //     newAngle[1] = newAngle[0];
      //     newAngle[0] = 0;
      // }
     let centerCircle = [(widthPrevious/2) * Math.cos(oldAngle + Math.PI/2), (heightPrevious/2) * Math.sin(oldAngle + Math.PI/2)];
    //  let centerCircle = [(widthPrevious/2), (heightPrevious/2)];
    // The coordinates of the new rectangle, bottom right refers to the first corner of the rectangle on the circle going counter clockwise
    // let bottomRight = [centerCircle[0] + (widthPrevious/2) * Math.cos(newAngle[newAngle.length - 2]), centerCircle[1] +  (widthPrevious/2) * Math.sin(newAngle[newAngle.length - 2])];
    // let bottomLeft = [centerCircle[0] + (widthPrevious/2) * Math.cos(newAngle[newAngle.length - 1]), centerCircle[1] + (widthPrevious/2) * Math.sin(newAngle[newAngle.length - 1])];
      let bottomRight = [(widthPrevious/2) * Math.cos(newAngle[newAngle.length - 2] + oldAngle), (widthPrevious/2) * Math.sin(newAngle[newAngle.length - 2] + oldAngle)];
      let bottomLeft = [(widthPrevious/2) * Math.cos(newAngle[newAngle.length - 1] + oldAngle), (widthPrevious/2) * Math.sin(newAngle[newAngle.length - 1] + oldAngle)];
    // console.log(centerCircle);
     // let t1 = [centerCircle[0] + Math.cos(newAngle[newAngle.length - 2]) * (widthPrevious/2)];
    // The mid point between the two corners calculated previously, relative to the previous rectangle
    let middle = [(bottomLeft[0] + bottomRight[0])/2, (bottomLeft[1] + bottomRight[1])/2];

    // This is the angle between the two lines going to the corners of the new rectangle
    let angle = (newAngle[newAngle.length - 1] + newAngle[newAngle.length - 2])/2;
    // The center coordinates of the new rectangle
    // let centerX = (widthPrevious / 2) * Math.cos(angle + oldAngle)+ middle[0]/2 + centerCircle[0];
    // let centerY = (heightPrevious / 2) * Math.sin(angle + oldAngle) + middle[1]/2 + centerCircle[1];

      let centerX = (width / 2) * Math.cos(angle + oldAngle)+ middle[0] + centerCircle[0];
      let centerY = (height / 2) * Math.sin(angle + oldAngle) + middle[1] + centerCircle[1];
        // centerX = centerX + middle[0] + centerCircle[0];
        // centerY = centerY + middle[1] + centerCircle[1];
    return [centerX, centerY];
  }

  private calculateRotation(newAngle: number[], oldAngle: number): number {
    let angle = newAngle[newAngle.length - 1] - newAngle[newAngle.length - 2];
    angle += oldAngle;
    return angle;
  }


}
