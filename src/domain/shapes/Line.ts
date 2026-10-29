import { Shape } from "./Shape";

export class Line extends Shape {
  private x1: number;
  private y1: number;
  private x2: number;
  private y2: number;

  public constructor(id: string, x1: number, y1: number, x2: number, y2: number, stroke?: string) {
    super(id);
    this.validateGeometry(x1, y1, x2, y2);
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    if (stroke !== undefined) {
      this.setAttribute("stroke", stroke);
    }
  }

  public getType(): string {
    return "line";
  }

  public move(dx: number, dy: number): void {
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
      throw new Error("move offsets must be finite numbers");
    }
    this.updateGeometry(this.x1 + dx, this.y1 + dy, this.x2 + dx, this.y2 + dy);
  }

  public scale(factor: number): void {
    if (!Number.isFinite(factor) || factor <= 0) {
      throw new Error("scale factor must be positive");
    }
    this.updateGeometry(this.x1 * factor, this.y1 * factor, this.x2 * factor, this.y2 * factor);
  }

  public describe(): string {
    return `line#${this.getId()} (${this.x1},${this.y1}) -> (${this.x2},${this.y2})${this.describeStyles()}`;
  }

  protected describeGeometry(): string {
    return `x1=${this.x1} y1=${this.y1} x2=${this.x2} y2=${this.y2}`;
  }

  protected setGeometryAttribute(attr: string, value: string): void {
    if (!["x1","y1","x2","y2"].includes(attr)) {
      throw new Error(`unknown attribute: ${attr}`);
    }
    const number = this.parseNumericAttribute(value);
    this.updateGeometry(
      attr === "x1" ? number : this.x1,
      attr === "y1" ? number : this.y1,
      attr === "x2" ? number : this.x2,
      attr === "y2" ? number : this.y2
    );
  }

  public captureGeometry(): () => void {
    const x1 = this.x1;
    const y1 = this.y1;
    const x2 = this.x2;
    const y2 = this.y2;
    return () => {
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;
    };
  }

  private updateGeometry(x1: number, y1: number, x2: number, y2: number): void {
    this.validateGeometry(x1, y1, x2, y2);
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  private validateGeometry(x1: number, y1: number, x2: number, y2: number): void {
    if (![x1, y1, x2, y2].every(Number.isFinite)) {
      throw new Error("line geometry must contain finite numbers");
    }
  }
}
