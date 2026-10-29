import { Shape } from "../../domain/shapes/Shape";
import { EditCommand } from "./EditCommand";

export class ScaleCommand implements EditCommand {
  private restoreGeometry: (() => void) | undefined;

  public constructor(
    private readonly shape: Shape,
    private readonly factor: number
  ) {}

  public execute(): string {
    const restore = this.shape.captureGeometry();

    this.shape.scale(this.factor);
    this.restoreGeometry = restore;

    return `${this.shape.getType()}#${this.shape.getId()} scaled by ${this.factor}`;
  }

  public undo(): string {
    if (this.restoreGeometry === undefined) {
      throw new Error("cannot undo a command that has not executed");
    }

    this.restoreGeometry();

    return `${this.shape.getType()}#${this.shape.getId()} restored`;
  }
}