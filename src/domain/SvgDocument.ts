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
  public addShape(shape: Shape, index: number = this.shapes.size): void {
    const id = shape.getId();

    if (this.shapes.has(id)) {
      throw new Error(`id already exists: ${id}`);
    }

    if (!Number.isInteger(index) || index < 0 || index > this.shapes.size) {
      throw new Error("invalid shape insertion index");
    }

    const entries = [...this.shapes.entries()];
    entries.splice(index, 0, [id, shape]);
    this.shapes.clear();
    for (const [key, value] of entries) {
      this.shapes.set(key, value);
    }
  }

  public getShapeIndex(id: string): number {
    this.getShape(id);
    return [...this.shapes.keys()].indexOf(id);
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