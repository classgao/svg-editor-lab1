import { Shape } from "../../domain/shapes/Shape";
import { EditCommand } from "./EditCommand";

export class MoveCommand implements EditCommand {
  private restoreGeometry: (() => void) | undefined;

  public constructor(
    private readonly shape: Shape,
    private readonly dx: number,
    private readonly dy: number
  ) {}

  public execute(): string {
    const restore = this.shape.captureGeometry();

    this.shape.move(this.dx, this.dy);
    this.restoreGeometry = restore;

    return `${this.shape.getType()}#${this.shape.getId()} moved by (${this.dx},${this.dy})`;
  }

  public undo(): string {
    if (this.restoreGeometry === undefined) {
      throw new Error("cannot undo a command that has not executed");
    }

    this.restoreGeometry();

    return `${this.shape.getType()}#${this.shape.getId()} restored`;
  }
}