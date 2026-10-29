import { SvgDocument } from "../domain/SvgDocument";
import { CommandHistory } from "./CommandHistory";
import { EditCommand } from "./commands/EditCommand";

export class EditorSession {
  private document: SvgDocument | undefined;
  private readonly history = new CommandHistory();

  public init(width: number = 800, height: number = 600): void {
    const newDocument = new SvgDocument(width, height);

    this.document = newDocument;
    this.history.blockAfterIo();
  }

  public getDocument(): SvgDocument {
    if (this.document === undefined) {
      throw new Error("no document. use 'init' or 'read' first");
    }

    return this.document;
  }

  public resizeCanvas(width: number, height: number): void {
    this.getDocument().resize(width, height);
    this.history.blockAfterIo();
  }

  public executeEdit(command: EditCommand): string {
    this.getDocument();
    return this.history.execute(command);
  }

  public undo(): string {
    this.getDocument();
    return this.history.undo();
  }

  public redo(): string {
    this.getDocument();
    return this.history.redo();
  }
}