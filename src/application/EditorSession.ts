import { GroupCommand } from "./commands/GroupCommand";
import { UngroupCommand } from "./commands/UngroupCommand";
import { AddToCommand } from "./commands/AddToCommand";
import { SetAttributeCommand } from "./commands/SetAttributeCommand";
import { DeleteShapeCommand } from "./commands/DeleteShapeCommand";
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
    params: string[],
    parentId?: string
  ): string {
    const document = this.getDocument();
    const parsed = this.shapeFactory.splitParent(type, params);
    const shape = this.shapeFactory.create(type, id, parsed.params);
    parentId = parentId ?? parsed.parentId;

    return this.executeEdit(new CreateShapeCommand(document, shape, parentId));
  }

  public tree(id?: string): string {
    const document = this.getDocument();
    const root = id === undefined ? undefined : document.getShape(id);
    const lines = [root === undefined
      ? `svg (${document.getWidth()}x${document.getHeight()})` : root.describe()];
    const visit = (children: readonly import("../domain/shapes/Shape").Shape[], prefix: string): void => {
      children.forEach((child, index) => {
        const last = index === children.length - 1;
        lines.push(prefix + (last ? "\u2514\u2500\u2500 " : "\u251c\u2500\u2500 ") + child.describe());
        visit(child.getChildren(), prefix + (last ? "    " : "\u2502   "));
      });
    };
    visit(root === undefined ? document.getShapes() : root.getChildren(), "");
    return lines.join("\n");
  }

  public describeShapes(): readonly string[] {
    return this.getDocument().getShapes().map((shape) => shape.describe());
  }

  public showShape(id: string): string {
    const shape = this.getDocument().getShape(id);
    const parentId = this.getDocument().getParentId(id);
    const header = `${shape.getType()}#${shape.getId()}  parent=${parentId === undefined ? "svg" : `g#${parentId}`}`;
    return [header, ...shape.describeDetails().map(line => `  ${line}`)].join("\n");
  }

  public describeShape(id: string): string {
    return this.getDocument().getShape(id).describe();
  }

  public setShapeAttribute(id: string, attr: string, value: string): string {
    const shape = this.getDocument().getShape(id);
    return this.executeEdit(new SetAttributeCommand(shape, attr, value));
  }

  public groupShapes(id: string, ids: string[]): string {
    return this.executeEdit(new GroupCommand(this.getDocument(), id, ids));
  }

  public ungroupShape(id: string): string {
    return this.executeEdit(new UngroupCommand(this.getDocument(), id));
  }

  public addTo(gid: string, id: string): string {
    return this.executeEdit(new AddToCommand(this.getDocument(), gid, id));
  }

  public deleteShape(id: string): string {
    return this.executeEdit(new DeleteShapeCommand(this.getDocument(), id));
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