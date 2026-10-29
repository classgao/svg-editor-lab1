export class SvgDocument {
  private width: number;
  private height: number;

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
}