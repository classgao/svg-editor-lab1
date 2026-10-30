import { Shape } from "./Shape";

export class Circle extends Shape {
  private cx: number;
  private cy: number;
  private r: number;

  public constructor(id: string, cx: number, cy: number, r: number, fill?: string) {
    super(id);
    this.validateGeometry(cx, cy, r);
    this.cx = cx;
    this.cy = cy;
    this.r = r;
    if (fill !== undefined) {
      this.setAttribute("fill", fill);
    }
  }

  protected geometryAttributes(): Record<string, string> {
    return { cx: String(this.cx), cy: String(this.cy), r: String(this.r) };
  }

  public getType(): string {
    return "circle";
  }

  public move(dx: number, dy: number): void {
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
      throw new Error("move offsets must be finite numbers");
    }
    this.updateGeometry(this.cx + dx, this.cy + dy, this.r);
  }

  public scale(factor: number): void {
    if (!Number.isFinite(factor) || factor <= 0) {
      throw new Error("scale factor must be positive");
    }
    this.updateGeometry(this.cx * factor, this.cy * factor, this.r * factor);
  }

  public describe(): string {
    return `circle#${this.getId()} ${this.describeGeometry()}${this.describeStyles()}`;
  }

  protected describeGeometry(): string {
    return `cx=${this.cx} cy=${this.cy} r=${this.r}`;
  }

  protected setGeometryAttribute(attr: string, value: string): void {
    if (!["cx","cy","r"].includes(attr)) {
      throw new Error(`unknown attribute: ${attr}`);
    }
    const number = this.parseNumericAttribute(value);
    this.updateGeometry(
      attr === "cx" ? number : this.cx,
      attr === "cy" ? number : this.cy,
      attr === "r" ? number : this.r
    );
  }

  public captureGeometry(): () => void {
    const cx = this.cx;
    const cy = this.cy;
    const r = this.r;
    return () => {
      this.cx = cx;
      this.cy = cy;
      this.r = r;
    };
  }

  private updateGeometry(cx: number, cy: number, r: number): void {
    this.validateGeometry(cx, cy, r);
    this.cx = cx;
    this.cy = cy;
    this.r = r;
  }

  private validateGeometry(cx: number, cy: number, r: number): void {
    if (![cx, cy, r].every(Number.isFinite)) {
      throw new Error("circle geometry must contain finite numbers");
    }
    if (r < 0) {
      throw new Error("circle radii must be non-negative");
    }
  }
}
