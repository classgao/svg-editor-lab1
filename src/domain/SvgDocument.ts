import { Shape } from "./shapes/Shape";
export class SvgDocument {
  private width: number;
  private height: number;
  private readonly shapes = new Map<string, Shape>();

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
  public addShape(shape: Shape): void {
    const id = shape.getId();

    if (this.shapes.has(id)) {
      throw new Error(`id already exists: ${id}`);
    }

    this.shapes.set(id, shape);
  }

  public getShape(id: string): Shape {
    const shape = this.shapes.get(id);

    if (shape === undefined) {
      throw new Error(`no such shape: ${id}`);
    }

    return shape;
  }

  public removeShape(id: string): Shape {
    const shape = this.getShape(id);
    this.shapes.delete(id);
    return shape;
  }

  public getShapes(): readonly Shape[] {
    return [...this.shapes.values()];
  }
}