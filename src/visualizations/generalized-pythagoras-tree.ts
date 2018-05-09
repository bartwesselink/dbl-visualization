import {Visualizer} from '../interfaces/visualizer';
import {Node} from '../models/node';
import {OpenGL} from '../opengl/opengl';
import {Form} from '../form/form';
import {FormFactory} from '../form/form-factory';

export class GeneralizedPythagorasTree implements Visualizer {
    /** @author Jules Cornelissen */

    private weightHeight: number = 1; // !! Currently broken !! Scaling factor for the height of every rectangle that is not the root
    private color : number[] = [1, 0, 1, 0.5]; // Just some test color, translucency to show that no rectangles overlap

    private initialRectangleCenterX : number = 0;
    private initialRectangleCenterY : number = -250;
    private initialRectangleWidth : number = 50;
    private initialRectangleHeight : number = 50;
    private initialRectangleAngle : number = 0;

    private radianToDegreeMultiplier = 180 / Math.PI;

    public draw(tree: Node, gl: OpenGL) {

        // Define the base rectangle of the visualized tree, these values can later be determined in settings
        // Rectangle is an array of 5 numbers, in order: center x, center y, width (X), height (Y), angle
        let rectangle = [this.initialRectangleCenterX, this.initialRectangleCenterY, this.initialRectangleWidth, this.initialRectangleHeight, this.initialRectangleAngle];

        // Call the main recursive drawing function
        this.generate(tree, rectangle, gl);

    }

    public getForm(formFactory: FormFactory): Form|null {
        return formFactory.createFormBuilder()
            .addTextField('test1', 'TestValue', { label: 'Test label' })
            .addNumberField('test2', 8, { label: 'Test label' })
            .addToggleField('test3', false, { label: 'Test label' })
            .addChoiceField('test4', 'test', { label: 'Test label', expanded: false, choices: { test: 'test' } })
            .addChoiceField('test5', 'test', { label: 'Test label', expanded: true, choices: { test: 'test' } })
            .getForm();
    }

    public applySettings(settings: object): void {
        console.log(settings);
    }

    public getName(): string {
        return 'Generalized Pythagoras Tree';
    }

    public getThumbnailImage(): string|null {
        return '/assets/images/visualization-generalized-pythagoras-tree.png';
    }

    private generate(tree: Node, rectangle: number[], gl: OpenGL): void {
        // Draw the previously calculated rectangle
        gl.fillRotatedQuad(rectangle[0], rectangle[1], rectangle[2], rectangle[3], rectangle[4] * this.radianToDegreeMultiplier, this.color);
        /** This function can be considered in two ways. The first way is as it's done here. We loop over all the children
         * of a node and consider what part this child is of the parent. Thus the child calculates what relative size it is
         * of the parent. The second way is to take the parent and calculate the relative size of each of its children.
         * Using the first way we can immediately recurse on the element we are considering, using the second way we need to
         * recurse on the children of the element we are considering.
         */
        if (tree.subTreeSize > 1) { // If a node does not have children it does not have to draw its children
            let angle: Array<number> = [0]; // Initialize to zero helps with calculating using the first angle

            // Loop over all the children of the node and recurse on each child
            for (let element of tree.children) {
                angle.push(angle[angle.length - 1] + Math.PI * (element.subTreeSize / (element.parent.subTreeSize - 1))); // Calculate the angle of every subtree
                let width = rectangle[2] * Math.sin((angle[angle.length - 1] - angle[angle.length - 2]) / 2); // The last value in the array is always the one calculated last
                let height = this.weightHeight * rectangle[3] * Math.sin((angle[angle.length - 1] - angle[angle.length - 2]) / 2);
                let center = this.calculateCenter(rectangle[2], rectangle[3], width, height, angle, rectangle[4]);

                // The previously calculated center coordinates still need to be offset by the old coordinates
                center = [center[0] + rectangle[0], center[1] + rectangle[1]];

                // The rotation of the new rectangle is equal to its angle relative to the angle of the rectangle that
                // comes before it. It needs to be offset by the angle of the parent rectangle and then offset by
                // -90 degrees for it to draw correctly using the fillRotatedQuad.
                let rotation = (angle[angle.length - 1] + angle[angle.length - 2]) / 2 + rectangle[4] - Math.PI / 2;
                let rectangleChild = [center[0], center[1], width, height, rotation];
                // Finally we recurse using all the previously calculated values
                this.generate(element, rectangleChild, gl);
            }
        }
    }

    /** calculateCenter calculates the nX and Y coordinates of the new rectangle, relative to the X and Y of the old
     * rectangle. The values calculated still need to be offset by center X and Y coordinates of the old rectangle
     * for proper placement on the canvas.
     * @param {number} widthPrevious The width of the old rectangle
     * @param {number} heightPrevious The height of the old rectangle
     * @param {number} width The width of the new rectangle
     * @param {number} height The Height of the new rectangle
     * @param {number[]} newAngle The array containing the angles for the new rectangle
     * @param {number} oldAngle The angle of rotation of the previous rectangle
     * @returns {number[]} Center X and Y coordinates of the new rectangle relative to the center X and Y coordinates of the old rectangle
     */

    private calculateCenter(widthPrevious: number, heightPrevious: number, width: number, height: number, newAngle: number[], oldAngle: number): number[] {
        // The center of the circle is located at the top middle of the parent rectangle
        let centerCircle = [(widthPrevious / 2) * Math.cos(oldAngle + Math.PI / 2), (heightPrevious / 2) * Math.sin(oldAngle + Math.PI / 2)];
        // The coordinates of the new rectangle, bottom right refers to the first corner of the rectangle on the circle going counter clockwise
        let bottomRight = [(widthPrevious / 2) * Math.cos(newAngle[newAngle.length - 2] + oldAngle), (heightPrevious / 2) * Math.sin(newAngle[newAngle.length - 2] + oldAngle)];
        let bottomLeft = [(widthPrevious / 2) * Math.cos(newAngle[newAngle.length - 1] + oldAngle), (heightPrevious / 2) * Math.sin(newAngle[newAngle.length - 1] + oldAngle)];
        // The mid point between the two corners calculated previously, relative to the previous rectangle
        let middle = [(bottomLeft[0] + bottomRight[0]) / 2, (bottomLeft[1] + bottomRight[1]) / 2];

        // This is the angle between the two lines going to the corners of the new rectangle
        let angle = (newAngle[newAngle.length - 1] + newAngle[newAngle.length - 2]) / 2;
        // The center coordinates of the new rectangle
        let centerX = (width / 2) * Math.cos(angle + oldAngle) + middle[0] + centerCircle[0];
        let centerY = (height / 2) * Math.sin(angle + oldAngle) + middle[1] + centerCircle[1];
        return [centerX, centerY];
    }

    /** @end-author Jules Cornelissen */
}
