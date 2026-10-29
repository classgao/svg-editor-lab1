import { Shape } from "./Shape";

export class Group extends Shape {
  private readonly children: Shape[] = [];

  public constructor(id: string) { super(id); }
  public getType(): string { return "g"; }
  public getChildren(): readonly Shape[] { return [...this.children]; }

  public insertChild(shape: Shape, index: number): void {
    if (!Number.isInteger(index) || index < 0 || index > this.children.length) {
      throw new Error("invalid shape insertion index");
    }
    if (this.contains(shape, this) || this.contains(this, shape)) {
      throw new Error("cannot create a cyclic or duplicate hierarchy");
    }
    this.children.splice(index, 0, shape);
  }

  public removeChild(shape: Shape): void {
    const index = this.children.indexOf(shape);
    if (index < 0) { throw new Error("shape is not a child"); }
    this.children.splice(index, 1);
  }

  public move(dx: number, dy: number): void {
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
      throw new Error("move offsets must be finite numbers");
    }
    this.applyAtomically(child => child.move(dx, dy));
  }

  public scale(factor: number): void {
    if (!Number.isFinite(factor) || factor <= 0) {
      throw new Error("scale factor must be positive");
    }
    this.applyAtomically(child => child.scale(factor));
  }

  public captureGeometry(): () => void {
    const restores = this.children.map(child => child.captureGeometry());
    return () => { restores.forEach(restore => restore()); };
  }

  public describe(): string { return `g#${this.getId()}${this.describeStyles()}`; }
  protected describeGeometry(): string { return ""; }
  protected setGeometryAttribute(attr: string, value: string): void {
    throw new Error(`unknown attribute: ${attr}`);
  }

  private applyAtomically(operation: (child: Shape) => void): void {
    const restore = this.captureGeometry();
    try {
      this.children.forEach(operation);
    } catch (error) {
      restore();
      throw error;
    }
  }

  private contains(root: Shape, target: Shape): boolean {
    return root === target || root.getChildren().some(child => this.contains(child, target));
  }
}
