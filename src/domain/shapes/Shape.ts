export abstract class Shape {
  private readonly id: string;
  private readonly styles = new Map<string, string>();
  public abstract getType(): string;

  protected constructor(id: string) {
    if (id.trim().length === 0) {
      throw new Error("shape id must not be empty");
    }

    this.id = id;
  }

  public getAttributes(): Readonly<Record<string, string>> {
    return { id: this.id, ...this.geometryAttributes(), ...Object.fromEntries(this.styles) };
  }

  public getTextContent(): string | undefined { return undefined; }

  protected abstract geometryAttributes(): Record<string, string>;

  public getChildren(): readonly Shape[] {
    return [];
  }

  public getId(): string {
    return this.id;
  }

  public setAttribute(attr: string, value: string): void {
    if (attr === "fill" || attr === "stroke" || attr === "stroke-width") {
      if (attr === "stroke-width") {
        const width = this.parseNumericAttribute(value);
        if (width < 0) {
          throw new Error("stroke-width must be non-negative");
        }
        this.styles.set(attr, String(width));
      } else {
        this.styles.set(attr, value);
      }
      return;
    }
    this.setGeometryAttribute(attr, value);
  }

  public captureState(): () => void {
    const restoreGeometry = this.captureGeometry();
    const styles = new Map(this.styles);
    return () => {
      restoreGeometry();
      this.styles.clear();
      for (const [key, value] of styles) {
        this.styles.set(key, value);
      }
    };
  }

  public describeDetails(): readonly string[] {
    const geometry = this.describeGeometry();
    const lines = geometry === "" ? [] : [geometry];
    for (const [key, value] of this.styles) {
      lines.push(`${key}=${value}`);
    }
    return lines;
  }

  protected abstract describeGeometry(): string;

  protected describeStyles(): string {
    return [...this.styles].map(([key, value]) => ` ${key}=${value}`).join("");
  }

  protected parseNumericAttribute(value: string): number {
    const number = Number(value);
    if (value.trim() === "" || !Number.isFinite(number)) {
      throw new Error(`invalid number: ${value}`);
    }
    return number;
  }

  protected abstract setGeometryAttribute(attr: string, value: string): void;

  public abstract move(dx: number, dy: number): void;

  public abstract scale(factor: number): void;

  public abstract describe(): string;

  public abstract captureGeometry(): () => void;
}