import { SvgDocument } from "../../domain/SvgDocument";
import { EditCommand } from "./EditCommand";

export class ReorderCommand implements EditCommand {
  private restore: (() => void) | undefined;

  public constructor(
    private readonly document: SvgDocument,
    private readonly id: string,
    private readonly toFront: boolean
  ) {}

  public execute(): string {
    const shape = this.document.getShape(this.id);
    const restore = this.document.captureHierarchy();
    this.document.reorderShape(this.id, this.toFront);
    this.restore = restore;
    return `${shape.getType()}#${this.id} moved to ${this.toFront ? "front" : "back"}`;
  }

  public undo(): string {
    if (this.restore === undefined) {
      throw new Error("cannot undo a command that has not executed");
    }
    this.restore();
    return "z-order restored";
  }
}
