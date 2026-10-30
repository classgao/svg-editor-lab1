import { SvgDocument } from "../../domain/SvgDocument";
import { EditCommand } from "./EditCommand";

export class AddToCommand implements EditCommand {
  private reapply: (() => void) | undefined;
  private result = "";
  private restore: (() => void) | undefined;
  public constructor(private readonly document: SvgDocument, private readonly gid: string, private readonly id: string) {}
  public execute(): string {
    if (this.reapply !== undefined) { this.reapply(); return this.result; }
    const restore = this.document.captureHierarchy();
    this.document.addTo(this.gid, this.id);
    this.restore = restore;
    this.reapply = this.document.captureHierarchy();
    this.result = `${this.id} moved into g#${this.gid}`;
    return this.result;
  }
  public undo(): string {
    if (this.restore === undefined) { throw new Error("cannot undo a command that has not executed"); }
    this.restore();
    return "hierarchy restored";
  }
}
