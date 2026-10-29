import { SvgDocument } from "../domain/SvgDocument";
import { CommandHistory } from "./CommandHistory";
import { EditCommand } from "./commands/EditCommand";
import { ShapeFactory } from "./ShapeFactory";
import { CreateShapeCommand } from "./commands/CreateShapeCommand";
import { MoveCommand } from "./commands/MoveCommand";
import { ScaleCommand } from "./commands/ScaleCommand";

export class EditorSession {
  private document: SvgDocument | undefined;
  private readonly history = new CommandHistory();
  private readonly shapeFactory = new ShapeFactory();

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

  public createShape(
    type: string,
    id: string,
    params: string[]
  ): string {
    const document = this.getDocument();
    const shape = this.shapeFactory.create(type, id, params);

    return this.executeEdit(new CreateShapeCommand(document, shape));
  }

  public describeShapes(): readonly string[] {
    return this.getDocument().getShapes().map((shape) => shape.describe());
  }

  public describeShape(id: string): string {
    return this.getDocument().getShape(id).describe();
  }

  public moveShape(id: string, dx: number, dy: number): string {
    const shape = this.getDocument().getShape(id);
    return this.executeEdit(new MoveCommand(shape, dx, dy));
  }

  public scaleShape(id: string, factor: number): string {
    const shape = this.getDocument().getShape(id);
    return this.executeEdit(new ScaleCommand(shape, factor));
  }
}