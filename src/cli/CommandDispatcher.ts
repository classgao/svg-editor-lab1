import { EditorSession } from "../application/EditorSession";

export class CommandDispatcher {
  public constructor(private readonly session: EditorSession) {}

  public dispatch(tokens: string[]): string {
    const [command, ...args] = tokens;

    switch (command) {
      case "help":
        if (args.length !== 0) {
          throw new Error("usage: help");
        }

        return [
          "当前已实现：",
          "  help          显示帮助",
          "  init [w] [h]  新建画布，默认 800×600",
          "  canvas [w h]  显示或修改画布尺寸",
          "  undo          撤销上一次编辑",
          "  redo          重做上一次撤销的编辑",
          "  Ctrl+C        退出程序",
        ].join("\n");

      case "init": {
        if (args.length > 2) {
          throw new Error("usage: init [w] [h]");
        }

        const width = args[0] === undefined ? 800 : this.parseNumber(args[0]);
        const height = args[1] === undefined ? 600 : this.parseNumber(args[1]);

        this.session.init(width, height);
        return `canvas ${width}x${height} created`;
      }

      case "canvas": {
        const document = this.session.getDocument();

        if (args.length === 0) {
          return `canvas ${document.getWidth()}x${document.getHeight()}`;
        }

        if (args.length !== 2) {
          throw new Error("usage: canvas [w h]");
        }

        const width = this.parseNumber(args[0]);
        const height = this.parseNumber(args[1]);

        this.session.resizeCanvas(width, height);
        return `canvas resized to ${width}x${height}`;
      }
      
      case "undo":
        if (args.length !== 0) {
          throw new Error("usage: undo");
        }

        return this.session.undo();

      case "redo":
        if (args.length !== 0) {
          throw new Error("usage: redo");
        }

        return this.session.redo();

      default:
        throw new Error(`unknown command: ${command}`);
    }
  }

  private parseNumber(value: string): number {
    if (value.trim() === "") {
      throw new Error("expected a number");
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      throw new Error(`invalid number: ${value}`);
    }

    return number;
  }
}