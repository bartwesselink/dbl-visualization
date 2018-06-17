import {Visualizer} from '../interfaces/visualizer';
import {Node} from '../models/node';
import {Form} from '../form/form';
import {FormFactory} from '../form/form-factory';
import {Draw} from '../interfaces/draw';
import {VisualizerInput} from '../interfaces/visualizer-input';
import {Palette} from "../models/palette";

export class SpaceReclaimingStack implements Visualizer {
    /** @author Jules Cornelissen */
    public draw(input: VisualizerInput): Draw[] {
        const tree = input.tree;
        const draws: Draw[] = [];
        const palette: Palette = input.palette;

        const weightHeight: number = input.settings.heightScale / 10; // Scaling factor for the height of every rectangle that is not the root
        const drawNodeSize: boolean = input.settings.nodeSize;
        let color: number[]; // Have to initialise it here otherwise typescript complains

        const initialRectangleCenterX: number = 0;
        const initialRectangleCenterY: number = -250;
        const initialRectangleWidth: number = 50;
        const initialRectangleHeight: number = 50;
        const initialRectangleAngle: number = 0;

        const radianToDegreeMultiplier = 180 / Math.PI;

        // Define the base rectangle of the visualized tree, these values can later be determined in settings
        // Rectangle is an array of 5 numbers, in order: center x, center y, width (X), height (Y), angle
        const rectangle = [initialRectangleCenterX, initialRectangleCenterY, initialRectangleWidth, initialRectangleHeight, initialRectangleAngle];

        /** calculateCenter calculates the nX and Y coordinates of the new rectangle, relative to the X and Y of the old
         * rectangle. The values calculated still need to be offset by center X and Y coordinates of the old rectangle
         * for proper placement on the canvas.
         * @param {number} widthPrevious The width of the old rectangle
         * @param {number} heightPrevious The height of the old rectangle
         * @param {number} width The width of the new rectangle
         * @param {number} height The Height of the new rectangle
         * @param (number) prevAngle The angle of rotation of the previous child
         * @param {number} newAngle The angle of rotation of the current child
         * @param {number} angleParent The angle of rotation of the parent rectangle
         * @returns {number[]} Center X and Y coordinates of the new rectangle relative to the center X and Y coordinates of the old rectangle
         */
        const calculateCenter = (widthPrevious: number, heightPrevious: number, width: number, height: number, prevAngle: number, newAngle: number, angleParent: number): number[] => {
            // The center of the circle is located at the top middle of the parent rectangle
            let centerCircle = [(heightPrevious / 2) * Math.cos(angleParent + Math.PI / 2), (heightPrevious / 2) * Math.sin(angleParent + Math.PI / 2)];
            // The coordinates of the new rectangle, bottom right refers to the first corner of the rectangle on the circle going counter clockwise
            let bottomRight = [(widthPrevious / 2) * Math.cos(prevAngle + angleParent), (widthPrevious / 2) * Math.sin(prevAngle + angleParent)];
            let bottomLeft = [(widthPrevious / 2) * Math.cos(newAngle + angleParent), (widthPrevious / 2) * Math.sin(newAngle + angleParent)];
            // The mid point between the two corners calculated previously, relative to the previous rectangle
            let middle = [(bottomLeft[0] + bottomRight[0]) / 2, (bottomLeft[1] + bottomRight[1]) / 2];

            // This is the angle between the two lines going to the corners of the new rectangle
            let angleDifference = (newAngle + prevAngle) / 2;
            // The center coordinates of the new rectangle
            let centerX = (height / 2) * Math.cos(angleDifference + angleParent) + middle[0] + centerCircle[0];
            let centerY = (height / 2) * Math.sin(angleDifference + angleParent) + middle[1] + centerCircle[1];
            return [centerX, centerY];
        };

        const generate = (tree: Node, rectangle: number[], isSelected: boolean = false): void => {
            if (tree.selected === true || isSelected) {
                isSelected = true;
                color = palette.gradientColorMapSelected[tree.maxDepth][tree.depth];
            } else {
                color = palette.gradientColorMap[tree.maxDepth][tree.depth];
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
                // Calculate the size of all the children of a parent ahead of time so that this only has to be done
                // once for all the children of a node, instead of once per child of a node.
                let sizeParent = 0; // Unfortunately have to always define otherwise typescript complains
                if (drawNodeSize) {
                    for (let child of tree.children) {
                        sizeParent += child.length;
                    }
                }
                let prevAngle;
                let newAngle = 0;
                // Loop over all the children of the node and recurse on each child
                for (let child of tree.children) {
                    prevAngle = newAngle;
                    if (!drawNodeSize) {
                        newAngle = newAngle + Math.PI * (child.subTreeSize / (child.parent.subTreeSize - 1));
                    } else {
                        newAngle = newAngle + Math.PI * (child.length / sizeParent);
                    }
                    let sinAngleDifference = Math.sin((newAngle - prevAngle) / 2); // This saves us one sin calculation per child
                    let width = rectangle[2] * sinAngleDifference; // The last value in the array is always the one calculated last
                    let height = weightHeight * rectangle[3] * sinAngleDifference;
                    let center = calculateCenter(rectangle[2], rectangle[3], width, height, prevAngle, newAngle, rectangle[4]);

                    // The previously calculated center coordinates still need to be offset by the old coordinates
                    center = [center[0] + rectangle[0], center[1] + rectangle[1]];

                    // The rotation of the new rectangle is equal to its angle relative to the angle of the rectangle that
                    // comes before it. It needs to be offset by the angle of the parent rectangle and then offset by
                    // -90 degrees for it to draw correctly using the fillRotatedQuad.
                    let rotation = (newAngle + prevAngle) / 2 + rectangle[4] - Math.PI / 2;
                    let rectangleChild = [center[0], center[1], width, height, rotation];
                    // Finally we recurse using all the previously calculated values
                    generate(child, rectangleChild, isSelected);
                }
            }
        };

        // Call the main recursive drawing function
        generate(tree, rectangle);
        return draws;
    }

    public getForm(formFactory: FormFactory): Form | null {
        return formFactory.createFormBuilder()
            .addSliderField("heightScale", 10, {label: "Height scale", min: 2, max: 20})
            .addToggleField("nodeSize", false, {label: "Calculate using size of nodes",})
            .getForm();
    }

    public getName(): string {
        return 'Generalized Pythagoras Tree';
    }

    public getThumbnailImage(): string | null {
        return '/assets/images/visualization-generalized-pythagoras-tree.png';
    }

    /** @end-author Jules Cornelissen */
}
