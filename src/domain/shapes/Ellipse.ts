import { Shape } from "./Shape";

export class Ellipse extends Shape {
  private cx: number;
  private cy: number;
  private rx: number;
  private ry: number;

  public constructor(id: string, cx: number, cy: number, rx: number, ry: number, fill?: string) {
    super(id);
    this.validateGeometry(cx, cy, rx, ry);
    this.cx = cx;
    this.cy = cy;
    this.rx = rx;
    this.ry = ry;
    if (fill !== undefined) {
      this.setAttribute("fill", fill);
    }
  }

  public getType(): string {
    return "ellipse";
  }

  public move(dx: number, dy: number): void {
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
      throw new Error("move offsets must be finite numbers");
    }
    this.updateGeometry(this.cx + dx, this.cy + dy, this.rx, this.ry);
  }

  public scale(factor: number): void {
    if (!Number.isFinite(factor) || factor <= 0) {
      throw new Error("scale factor must be positive");
    }
    this.updateGeometry(this.cx * factor, this.cy * factor, this.rx * factor, this.ry * factor);
  }

  public describe(): string {
    return `ellipse#${this.getId()} ${this.describeGeometry()}${this.describeStyles()}`;
  }

  protected describeGeometry(): string {
    return `cx=${this.cx} cy=${this.cy} rx=${this.rx} ry=${this.ry}`;
  }

  protected setGeometryAttribute(attr: string, value: string): void {
    if (!["cx","cy","rx","ry"].includes(attr)) {
      throw new Error(`unknown attribute: ${attr}`);
    }
    const number = this.parseNumericAttribute(value);
    this.updateGeometry(
      attr === "cx" ? number : this.cx,
      attr === "cy" ? number : this.cy,
      attr === "rx" ? number : this.rx,
      attr === "ry" ? number : this.ry
    );
  }

  public captureGeometry(): () => void {
    const cx = this.cx;
    const cy = this.cy;
    const rx = this.rx;
    const ry = this.ry;
    return () => {
      this.cx = cx;
      this.cy = cy;
      this.rx = rx;
      this.ry = ry;
    };
  }

  private updateGeometry(cx: number, cy: number, rx: number, ry: number): void {
    this.validateGeometry(cx, cy, rx, ry);
    this.cx = cx;
    this.cy = cy;
    this.rx = rx;
    this.ry = ry;
  }

  private validateGeometry(cx: number, cy: number, rx: number, ry: number): void {
    if (![cx, cy, rx, ry].every(Number.isFinite)) {
      throw new Error("ellipse geometry must contain finite numbers");
    }
    if (rx < 0 || ry < 0) {
      throw new Error("ellipse radii must be non-negative");
    }
  }
}
