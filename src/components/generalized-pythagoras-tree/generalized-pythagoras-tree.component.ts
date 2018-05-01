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

  public generate(tree: node, rectangle: number[]): void {
    // Rectangle is an array of 5 numbers, in order: center x, center y, width (X), height (Y), angle
    drawRectangle(rectangle);
    if (tree.hasChild()) { // If a node does not have children it does not have to draw its children
      for (let element of tree.getChildren()) {
        let angle = Math.PI * (element.getSizeNode() / element.getSizeSubTree()); // Calculate the angle of every subtree
        let width = rectangle[2] * Math.sin(angle / 2);
        let height = this.weightHeight * rectangle[3] * Math.sin(angle / 2);
        let center = this.calculateCenter();
        let rotation = this.calculateRotation();
        let rectangleChild = [center[0], center[1], width, height, rotation];
        this.generate(element, rectangleChild);
      }
    }
  }

  private calculateCenter(): number[] {
    return [0, 0];
  }

  private calculateRotation(): number {
    return 0;
  }

}


class DataStructure {

  children: node[]; // if children == undefined, no children thus a leaf
  parent: node; // if parent == undefined, no parent thus a root
  nodeSizeChildren = [];

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

  /** The management functions like addChild, removeChild, calculating size can be much more effecient if handled
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
