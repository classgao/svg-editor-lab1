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
          "  create rect <id> <x> <y> <w> <h> [fill]",
          "  tree [id]     显示文档或指定图形",
          "  move <id> <dx> <dy>  按增量移动图形",
          "  scale <id> <factor>  等比缩放位置与尺寸",
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
      
      case "create": {
        if (args.length < 2) {
          throw new Error("usage: create <type> <id> [params...]");
        }

        const [type, id, ...params] = args;
        return this.session.createShape(type, id, params);
      }

      case "tree": {
        const document = this.session.getDocument();

        if (args.length > 1) {
          throw new Error("usage: tree [id]");
        }

        if (args.length === 1) {
          return this.session.describeShape(args[0]);
        }

        const shapes = this.session.describeShapes();
        const lines = [
          `svg (${document.getWidth()}x${document.getHeight()})`,
        ];

        shapes.forEach((description, index) => {
          const branch = index === shapes.length - 1 ? "└──" : "├──";
          lines.push(`${branch} ${description}`);
        });

        return lines.join("\n");
      }

      case "move": {
        this.session.getDocument();

        if (args.length !== 3) {
          throw new Error("usage: move <id> <dx> <dy>");
        }

        const dx = this.parseNumber(args[1]);
        const dy = this.parseNumber(args[2]);

        return this.session.moveShape(args[0], dx, dy);
      }

      case "scale": {
        this.session.getDocument();

        if (args.length !== 2) {
          throw new Error("usage: scale <id> <factor>");
        }

        const factor = this.parseNumber(args[1]);
        return this.session.scaleShape(args[0], factor);
      }

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