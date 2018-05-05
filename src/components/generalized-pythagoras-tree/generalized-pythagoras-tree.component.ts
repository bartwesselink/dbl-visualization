import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-generalized-pythagoras-tree',
  templateUrl: './generalized-pythagoras-tree.component.html',
})
export class GeneralizedPythagorasTreeComponent implements OnInit {
  /** @author Jules Cornelissen */

  constructor() {
  }

  ngOnInit() {
    //const tree[] = [new node(), new node()];
    let tree = new node(3);
  }

  weightHeight = 1; // Scaling factor for the height of every rectangle that is not the root
  color = [1,0,1,1]; // Just some test color

  public generate(tree: node, rectangle: number[]): void {
    // Rectangle is an array of 5 numbers, in order: center x, center y, width (X), height (Y), angle
    // drawRotatedQuad(rectangle[0], rectangle[1], rectangle[2], rectangle[3], rectangle[4], this.color);
    /** This function can be considered in two ways. The first way is as it's done here. We loop over all the children
     * of a node and consider what part this child is of the parent. Thus the child calculates what relative size it is
     * of the parent. The second way is to take the parent and calculate the relative size of each of its children.
     * Using the first way we can immediately recurse on the element we are considering, using the second way we need to
     * recurse on the children of the element we are considering.
     */
    if (tree.hasChild()) { // If a node does not have children it does not have to draw its children
      let angle: Array<number> = [];
      for (let element of tree.getChildren()) {
        angle.push(Math.PI * (element.getSizeSubTree() / element.getParent().getSizeSubTree())); // Calculate the angle of every subtree
        let width = rectangle[2] * Math.sin(angle[angle.length - 1] / 2); // The last value in the array is always the one calculated last
        let height = this.weightHeight * rectangle[3] * Math.sin(angle[angle.length - 1] / 2);
        let center = this.calculateCenter(rectangle[2], width, height, angle, rectangle[4]);
        let rotation = this.calculateRotation(angle, rectangle[4]);
        let rectangleChild = [center[0], center[1], width, height, rotation];
        this.generate(element, rectangleChild);
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

class node {
  children: Array<node>; // if children == undefined, no children thus a leaf
  parent: node; // if parent == undefined, no parent thus a root
  sizeNode: number;
  sizeSubTree: number;

  /* Commented out because a constructor with fewer requirements is favorable in this case.
  TODO A better solution would be to have multiple constructors (not allowed) or defaults (null is not allowed).
  constructor(children: node[], parent: node, sizeNode: number) {
    this.children = children;
    this.parent = parent;
    this.sizeNode = sizeNode;
  }
  */
  constructor(sizeNode: number) {
    this.sizeNode = sizeNode;
  }

  private calculateSize() {
    let size: number = this.sizeNode;
    for (let element of this.children) {
      size += element.getSizeSubTree();
    }
    this.sizeSubTree = size;
  }

  /** The management functions like addChild, removeChild, calculating size can be much more efficient if handled
   * by a dedicated data structure like class. For now this is a quick implementation which does the job.
   */

  /* Adds the given child to the end of the array */
  public addChild(child: node): void {
    this.children.push(child);
    this.calculateSize(); // Efficiency can be increased by getting size of child before removing and subtracting that amount instead
  }

  /* Removes the first child identical to the given child in the array */
  public removeChild(child: node): void {
    let index: number = this.children.indexOf(child)
    this.children.splice(index, 1);
    this.calculateSize(); // Efficiency can be increased by getting size of child and adding that amount instead
  }

  public getSizeNode(): number {
    return this.sizeNode;
  }

  public getSizeSubTree(): number {
    return this.sizeSubTree;
  }

  public getChildren(): node[] {
    return this.children;
  }

  public getParent(): node{
    return this.parent;
  }

  public hasParent(): boolean {
    if (this.parent === undefined) {
      return false;
    } else {
      return true;
    }
  }

  public hasChild(): boolean {
    if (this.children === undefined) {
      return false;
    } else {
      return true;
    }
  }
}

/** @end-author Jules Cornelissen */
