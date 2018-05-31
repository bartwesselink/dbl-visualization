import {Visualizer} from '../interfaces/visualizer';
import {Node} from '../models/node';
import {OpenGL} from '../opengl/opengl';
import {Form} from '../form/form';
import {FormFactory} from '../form/form-factory';
import {Draw} from '../interfaces/draw';
import {VisualizerInput} from '../interfaces/visualizer-input';
import {Palette} from "../models/palette";

export class GeneralizedPythagorasTree implements Visualizer {
    /** @author Jules Cornelissen */
    public draw(input: VisualizerInput): Draw[] {
        const tree = input.tree;
        const draws: Draw[] = [];
        const palette: Palette = input.palette;
        // palette.printtoconsole();
        // palette.calcGradientColorMap(tree);

        const primaryColor = palette.primary;
        const secondaryColor = palette.secondary;


        const weightHeight: number = 1; // !! Currently broken !! Scaling factor for the height of every rectangle that is not the root
        const defaultColor: number[] = [1, 0, 1, 0.5]; // Just some test color, translucency to show that no rectangles overlap
        const selectedColor: number[] = [1, 0, 1, 1];
        let color: number[] = defaultColor;

        const initialRectangleCenterX: number = 0;
        const initialRectangleCenterY: number = -250;
        const initialRectangleWidth: number = 50;
        const initialRectangleHeight: number = 50;
        const initialRectangleAngle: number = 0;

        const radianToDegreeMultiplier = 180 / Math.PI;

        // Define the base rectangle of the visualized tree, these values can later be determined in settings
        // Rectangle is an array of 5 numbers, in order: center x, center y, width (X), height (Y), angle
        let rectangle = [initialRectangleCenterX, initialRectangleCenterY, initialRectangleWidth, initialRectangleHeight, initialRectangleAngle];

        //return Color.HSBtoRGB(subTreeSize / 256.0F, 1.0F, subTreeSize / (subTreeSize + 8.0F));


        // const calcColor = (tree: Node): number[] => {
        //     let red: number = (primaryColor.r + secondaryColor.r) / 2 * (tree.depth / tree.maxDepth);
        //     let green: number = (primaryColor.g + secondaryColor.g) / 2 * (tree.depth / tree.maxDepth);
        //     let blue: number = (primaryColor.b + secondaryColor.b) / 2 * (tree.depth / tree.maxDepth);
        //     let alpha: number = (primaryColor.a + secondaryColor.a) / 2 * (tree.depth / tree.maxDepth);
        //     return [red,green,blue,alpha];
        // }

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
        const calculateCenter = (widthPrevious: number, heightPrevious: number, width: number, height: number, newAngle: number[], oldAngle: number): number[] => {
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
        };

        const generate = (tree: Node, rectangle: number[], isSelected: boolean = false): void => {
            if (tree.selected === true || isSelected) {
                isSelected = true;
                color = palette.gradientColorMapSelected[tree.depth];
            } else {
                color = palette.gradientColorMap[tree.depth];
            }
            // Draw the previously calculated rectangle
            draws.push({
                type: 1 /** FillRotatedQuad **/,
                identifier: tree.identifier,
                options: {
                    x: rectangle[0],
                    y: rectangle[1],
                    width: rectangle[2],
                    height: rectangle[3],
                    rotation: rectangle[4] * radianToDegreeMultiplier,
                    color: color
                }
            });

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
                    let height = weightHeight * rectangle[3] * Math.sin((angle[angle.length - 1] - angle[angle.length - 2]) / 2);
                    let center = calculateCenter(rectangle[2], rectangle[3], width, height, angle, rectangle[4]);

                    // The previously calculated center coordinates still need to be offset by the old coordinates
                    center = [center[0] + rectangle[0], center[1] + rectangle[1]];

                    // The rotation of the new rectangle is equal to its angle relative to the angle of the rectangle that
                    // comes before it. It needs to be offset by the angle of the parent rectangle and then offset by
                    // -90 degrees for it to draw correctly using the fillRotatedQuad.
                    let rotation = (angle[angle.length - 1] + angle[angle.length - 2]) / 2 + rectangle[4] - Math.PI / 2;
                    let rectangleChild = [center[0], center[1], width, height, rotation];
                    // Finally we recurse using all the previously calculated values
                    generate(element, rectangleChild, isSelected);
                }
            }
        };

        // Call the main recursive drawing function
        generate(tree, rectangle);

        return draws;
    }

    public getForm(formFactory: FormFactory): Form | null {
        return null;
        // return formFactory.createFormBuilder()
        //     .addTextField('test1', 'TestValue', {label: 'Test label'})
        //     .addNumberField('test2', 8, {label: 'Test label'})
        //     .addToggleField('test3', false, {label: 'Test label'})
        //     .addChoiceField('test4', 'test', {label: 'Test label', expanded: false, choices: {test: 'test'}})
        //     .addChoiceField('test5', 'test', {label: 'Test label', expanded: true, choices: {test: 'test'}})
        //     .getForm();
    }

    public getName(): string {
        return 'Generalized Pythagoras Tree';
    }

    public getThumbnailImage(): string | null {
        return '/assets/images/visualization-generalized-pythagoras-tree.png';
    }

    /** @end-author Jules Cornelissen */
}
