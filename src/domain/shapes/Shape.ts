export abstract class Shape {
  private readonly id: string;
  public abstract getType(): string;

  protected constructor(id: string) {
    if (id.trim().length === 0) {
      throw new Error("shape id must not be empty");
    }

    this.id = id;
  }

  public getId(): string {
    return this.id;
  }

  public abstract move(dx: number, dy: number): void;

  public abstract scale(factor: number): void;

  public abstract describe(): string;
}