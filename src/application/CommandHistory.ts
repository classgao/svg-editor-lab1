import { EditCommand } from "./commands/EditCommand";

export class CommandHistory {
  private readonly undoStack: EditCommand[] = [];
  private readonly redoStack: EditCommand[] = [];
  private blockedByIo = false;

  public execute(command: EditCommand): string {
    const result = command.execute();

    this.undoStack.push(command);
    this.redoStack.length = 0;
    this.blockedByIo = false;

    return result;
  }

  public undo(): string {
    this.ensureHistoryAllowed();

    const command = this.undoStack[this.undoStack.length - 1];

    if (command === undefined) {
      throw new Error("nothing to undo");
    }

    const result = command.undo();

    this.undoStack.pop();
    this.redoStack.push(command);

    return result;
  }

  public redo(): string {
    this.ensureHistoryAllowed();

    const command = this.redoStack[this.redoStack.length - 1];

    if (command === undefined) {
      throw new Error("nothing to redo");
    }

    const result = command.execute();

    this.redoStack.pop();
    this.undoStack.push(command);

    return result;
  }

  public blockAfterIo(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.blockedByIo = true;
  }

  private ensureHistoryAllowed(): void {
    if (this.blockedByIo) {
      throw new Error("undo not allowed after io command");
    }
  }
}