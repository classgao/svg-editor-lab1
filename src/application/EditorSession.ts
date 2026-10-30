import { DocumentStore } from "./ports/DocumentStore";
import { ReorderCommand } from "./commands/ReorderCommand";
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
  private currentPath: string | undefined;
  public constructor(private readonly store?: DocumentStore) {}

  private document: SvgDocument | undefined;
  private readonly history = new CommandHistory();
  private readonly shapeFactory = new ShapeFactory();

  public init(width: number = 800, height: number = 600): void {
    const newDocument = new SvgDocument(width, height);

    this.document = newDocument;
    this.currentPath = undefined;
    this.history.blockAfterIo();
  }

  public read(path: string): string {
    if (this.store === undefined) { throw new Error("document storage is not configured"); }
    const result = this.store.read(path);
    this.document = result.document;
    this.currentPath = path;
    this.history.blockAfterIo();
    const count = (nodes: readonly import("../domain/shapes/Shape").Shape[]): number => nodes.reduce((sum, node) => sum + 1 + count(node.getChildren()), 0);
    return [...result.warnings, `read ${path} (${count(result.document.getShapes())} elements)`].join("\n");
  }

  public save(path?: string): string {
    const document = this.getDocument();
    const target = path ?? this.currentPath;
    if (target === undefined || target.trim() === "") {
      throw new Error("no file path. use 'save <file.svg>'");
    }
    if (this.store === undefined) { throw new Error("document storage is not configured"); }
    try { this.store.save(document, target); }
    catch { throw new Error(`cannot write file: ${target}`); }
    this.currentPath = target;
    this.history.blockAfterIo();
    const count = (shapes: readonly import("../domain/shapes/Shape").Shape[]): number =>
      shapes.reduce((total, shape) => total + 1 + count(shape.getChildren()), 0);
    return `saved to ${target} (${count(document.getShapes())} elements)`;
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

  public reorderShape(id: string, toFront: boolean): string {
    return this.executeEdit(new ReorderCommand(this.getDocument(), id, toFront));
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