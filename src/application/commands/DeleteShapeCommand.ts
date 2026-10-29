import { SvgDocument } from "../../domain/SvgDocument";
import { Shape } from "../../domain/shapes/Shape";
import { EditCommand } from "./EditCommand";

export class DeleteShapeCommand implements EditCommand {
  private removed: Shape | undefined;
  private index: number | undefined;

  public constructor(
    private readonly document: SvgDocument,
    private readonly id: string
  ) {}

  public execute(): string {
    const index = this.document.getShapeIndex(this.id);
    const shape = this.document.removeShape(this.id);
    this.removed = shape;
    this.index = index;
    return `${shape.getType()}#${this.id} deleted`;
  }

  public undo(): string {
    if (this.removed === undefined || this.index === undefined) {
      throw new Error("cannot undo a command that has not executed");
    }
    this.document.addShape(this.removed, this.index);
    return `${this.removed.getType()}#${this.id} restored`;
  }
}
