import { Group } from "./shapes/Group";
import { Shape } from "./shapes/Shape";
export class SvgDocument {
  private width: number;
  private height: number;
  private readonly shapes: Shape[] = [];

  public constructor(width: number = 800, height: number = 600) {
    this.validateDimensions(width, height);
    this.width = width;
    this.height = height;
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public resize(width: number, height: number): void {
    this.validateDimensions(width, height);
    this.width = width;
    this.height = height;
  }

  private validateDimensions(width: number, height: number): void {
    if (
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width <= 0 ||
      height <= 0
    ) {
      throw new Error("canvas dimensions must be positive finite numbers");
    }
  }
  public addShape(shape: Shape, index?: number, parentId?: string): void {
    const parent = parentId === undefined ? undefined : this.getContainer(parentId);
    const siblings = parent === undefined ? this.shapes : parent.getChildren();
    const position = index ?? siblings.length;
    if (!Number.isInteger(position) || position < 0 || position > siblings.length) {
      throw new Error("invalid shape insertion index");
    }
    const seen = new Set<string>();
    for (const node of this.walk([shape])) {
      if (seen.has(node.getId()) || this.findShape(node.getId()) !== undefined) {
        throw new Error(`id already exists: ${node.getId()}`);
      }
      seen.add(node.getId());
    }
    if (parent === undefined) { this.shapes.splice(position, 0, shape); }
    else { parent.insertChild(shape, position); }
  }

  public getContainer(id: string): Group {
    const shape = this.findShape(id);
    if (shape === undefined) { throw new Error(`no such container: ${id}`); }
    if (!(shape instanceof Group)) { throw new Error(`not a container: ${id}`); }
    return shape;
  }

  public getParentId(id: string): string | undefined {
    const target = this.getShape(id);
    for (const node of this.walk(this.shapes)) {
      if (node.getChildren().includes(target)) { return node.getId(); }
    }
    return undefined;
  }

  public getShapeIndex(id: string): number {
    const shape = this.getShape(id);
    const parentId = this.getParentId(id);
    const siblings = parentId === undefined ? this.shapes : this.getContainer(parentId).getChildren();
    return siblings.indexOf(shape);
  }

  public getShape(id: string): Shape {
    const shape = this.findShape(id);
    if (shape === undefined) { throw new Error(`no such shape: ${id}`); }
    return shape;
  }

  public removeShape(id: string): Shape {
    const shape = this.getShape(id);
    const parentId = this.getParentId(id);
    if (parentId === undefined) { this.shapes.splice(this.shapes.indexOf(shape), 1); }
    else { this.getContainer(parentId).removeChild(shape); }
    return shape;
  }

  public getShapes(): readonly Shape[] { return [...this.shapes]; }

  private findShape(id: string): Shape | undefined {
    return this.walk(this.shapes).find(shape => shape.getId() === id);
  }

  private walk(roots: readonly Shape[]): Shape[] {
    const nodes: Shape[] = [];
    const seen = new Set<Shape>();
    const visit = (shape: Shape): void => {
      if (seen.has(shape)) { throw new Error("cyclic or duplicate hierarchy"); }
      seen.add(shape);
      nodes.push(shape);
      shape.getChildren().forEach(visit);
    };
    roots.forEach(visit);
    return nodes;
  }
}
