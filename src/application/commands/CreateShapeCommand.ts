import { SvgDocument } from "../../domain/SvgDocument";
import { Shape } from "../../domain/shapes/Shape";
import { EditCommand } from "./EditCommand";

export class CreateShapeCommand implements EditCommand {
  public constructor(
    private readonly document: SvgDocument,
    private readonly shape: Shape,
    private readonly parentId?: string
  ) {}

  public execute(): string {
    this.document.addShape(this.shape, undefined, this.parentId);
    return `${this.shape.getType()}#${this.shape.getId()} created${this.parentId === undefined ? "" : ` in g#${this.parentId}`}`;
  }

  public undo(): string {
    this.document.removeShape(this.shape.getId());
    return `${this.shape.getType()}#${this.shape.getId()} removed`;
  }
}