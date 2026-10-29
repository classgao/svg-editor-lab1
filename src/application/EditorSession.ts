import { SvgDocument } from "../domain/SvgDocument";

export class EditorSession {
  private document: SvgDocument | undefined;

  public init(width: number = 800, height: number = 600): void {
    const newDocument = new SvgDocument(width, height);
    this.document = newDocument;
  }

  public getDocument(): SvgDocument {
    if (this.document === undefined) {
      throw new Error("no document. use 'init' or 'read' first");
    }

    return this.document;
  }
}