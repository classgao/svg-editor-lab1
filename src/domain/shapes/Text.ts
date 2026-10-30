import { Shape } from "./Shape";

export class Text extends Shape {
  private x: number;
  private y: number;
  private content: string;

  public constructor(id: string, x: number, y: number, content: string) {
    super(id);
    this.validateGeometry(x, y);
    this.x = x;
    this.y = y;
    this.content = content;
  }

  protected geometryAttributes(): Record<string, string> {
    return { x: String(this.x), y: String(this.y) };
  }

  public getTextContent(): string { return this.content; }

  public getType(): string {
    return "text";
  }

  public move(dx: number, dy: number): void {
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
      throw new Error("move offsets must be finite numbers");
    }
    this.updateGeometry(this.x + dx, this.y + dy);
  }

  public scale(factor: number): void {
    if (!Number.isFinite(factor) || factor <= 0) {
      throw new Error("scale factor must be positive");
    }
    this.updateGeometry(this.x * factor, this.y * factor);
  }

  public describe(): string {
    return `text#${this.getId()} (${this.x},${this.y}) ${JSON.stringify(this.content)}${this.describeStyles()}`;
  }

  public describeDetails(): readonly string[] {
    return [...super.describeDetails(), `text=${JSON.stringify(this.content)}`];
  }

  protected describeGeometry(): string {
    return `x=${this.x} y=${this.y}`;
  }

  protected setGeometryAttribute(attr: string, value: string): void {
    if (attr === "text") {
      this.content = value;
      return;
    }
    if (attr !== "x" && attr !== "y") {
      throw new Error(`unknown attribute: ${attr}`);
    }
    const number = this.parseNumericAttribute(value);
    this.updateGeometry(attr === "x" ? number : this.x, attr === "y" ? number : this.y);
  }

  public captureGeometry(): () => void {
    const x = this.x;
    const y = this.y;
    return () => {
      this.x = x;
      this.y = y;
    };
  }

  public captureState(): () => void {
    const restoreBase = super.captureState();
    const content = this.content;
    return () => {
      restoreBase();
      this.content = content;
    };
  }

  private updateGeometry(x: number, y: number): void {
    this.validateGeometry(x, y);
    this.x = x;
    this.y = y;
  }

  private validateGeometry(x: number, y: number): void {
    if (![x, y].every(Number.isFinite)) {
      throw new Error("text geometry must contain finite numbers");
    }
  }
}
