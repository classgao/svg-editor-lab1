import { Shape } from "./Shape";

export class Rectangle extends Shape {
  private x: number;
  private y: number;
  private width: number;
  private height: number;

  public constructor(
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fill?: string
  ) {
    super(id);
    this.validateGeometry(x, y, width, height);

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    if (fill !== undefined) {
      this.setAttribute("fill", fill);
    }
  }

  public move(dx: number, dy: number): void {
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
      throw new Error("move offsets must be finite numbers");
    }

    const nextX = this.x + dx;
    const nextY = this.y + dy;

    this.validateGeometry(nextX, nextY, this.width, this.height);

    this.x = nextX;
    this.y = nextY;
  }

  public scale(factor: number): void {
    if (!Number.isFinite(factor) || factor <= 0) {
      throw new Error("scale factor must be positive");
    }

    const nextX = this.x * factor;
    const nextY = this.y * factor;
    const nextWidth = this.width * factor;
    const nextHeight = this.height * factor;

    this.validateGeometry(nextX, nextY, nextWidth, nextHeight);

    this.x = nextX;
    this.y = nextY;
    this.width = nextWidth;
    this.height = nextHeight;
  }

  public describe(): string {
    const geometry =
      `x=${this.x} y=${this.y} w=${this.width} h=${this.height}`;

    const style = this.describeStyles();

    return `rect#${this.getId()} ${geometry}${style}`;
  }

  protected describeGeometry(): string {
    return `x=${this.x} y=${this.y} width=${this.width} height=${this.height}`;
  }

  protected setGeometryAttribute(attr: string, value: string): void {
    if (!["x", "y", "width", "height"].includes(attr)) {
      throw new Error(`unknown attribute: ${attr}`);
    }
    const number = this.parseNumericAttribute(value);
    const x = attr === "x" ? number : this.x;
    const y = attr === "y" ? number : this.y;
    const width = attr === "width" ? number : this.width;
    const height = attr === "height" ? number : this.height;
    this.validateGeometry(x, y, width, height);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  private validateGeometry(
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    if (![x, y, width, height].every(Number.isFinite)) {
      throw new Error("rectangle geometry must contain finite numbers");
    }

    if (width < 0 || height < 0) {
      throw new Error("rectangle dimensions must be non-negative");
    }
  }
  protected geometryAttributes(): Record<string, string> {
    return { x: String(this.x), y: String(this.y), width: String(this.width), height: String(this.height) };
  }

  public getType(): string {
    return "rect";
  }

  public captureGeometry(): () => void {
    const x = this.x;
    const y = this.y;
    const width = this.width;
    const height = this.height;

    return () => {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    };
  }
}