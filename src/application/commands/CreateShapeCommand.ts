import { SvgDocument } from "../../domain/SvgDocument";
import { Shape } from "../../domain/shapes/Shape";
import { EditCommand } from "./EditCommand";

export class CreateShapeCommand implements EditCommand {
  public constructor(
    private readonly document: SvgDocument,
    private readonly shape: Shape
  ) {}

  public execute(): string {
    this.document.addShape(this.shape);
    return `${this.shape.getType()}#${this.shape.getId()} created`;
  }

  public undo(): string {
    this.document.removeShape(this.shape.getId());
    return `${this.shape.getType()}#${this.shape.getId()} removed`;
  }
}