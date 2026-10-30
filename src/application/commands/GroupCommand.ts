import { SvgDocument } from "../../domain/SvgDocument";
import { EditCommand } from "./EditCommand";

export class GroupCommand implements EditCommand {
  private reapply: (() => void) | undefined;
  private result = "";
  private restore: (() => void) | undefined;
  public constructor(private readonly document: SvgDocument, private readonly newId: string, private readonly ids: readonly string[]) {}
  public execute(): string {
    if (this.reapply !== undefined) { this.reapply(); return this.result; }
    const restore = this.document.captureHierarchy();
    this.document.group(this.newId, this.ids);
    this.restore = restore;
    this.reapply = this.document.captureHierarchy();
    this.result = `g#${this.newId} created with ${this.ids.length} children`;
    return this.result;
  }
  public undo(): string {
    if (this.restore === undefined) { throw new Error("cannot undo a command that has not executed"); }
    this.restore();
    return "hierarchy restored";
  }
}
