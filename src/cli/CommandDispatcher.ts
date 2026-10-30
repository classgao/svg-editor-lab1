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
          "  read <file.svg>  读取 SVG 文件",
          "  save [file.svg]  保存 SVG 文件",
          "  help          显示帮助",
          "  init [w] [h]  新建画布，默认 800×600",
          "  canvas [w h]  显示或修改画布尺寸",
          "  undo          撤销上一次编辑",
          "  redo          重做上一次撤销的编辑",
          "  Ctrl+C        退出程序",
          "  set <id> <attr> <value>  设置属性",
          "  front <id> / back <id>  调整同级图层顺序",
          "  group <newGid> <id1> [id2 ...]",
          "  ungroup <gid>",
          "  addto <gid> <id>",
          "  delete <id>   删除图形",
          "  create circle <id> <cx> <cy> <r> [fill]",
          "  create ellipse <id> <cx> <cy> <rx> <ry> [fill]",
          "  create line <id> <x1> <y1> <x2> <y2> [stroke]",
          '  create text <id> <x> <y> "content"',
          "  create g <id> ; all create commands support [in <containerId>]",
          "  create rect <id> <x> <y> <w> <h> [fill]",
          "  show <id>     显示图形属性明细",
          "  tree [id]     显示文档或指定图形",
          "  move <id> <dx> <dy>  按增量移动图形",
          "  scale <id> <factor>  等比缩放位置与尺寸",
        ].join("\n");

      case "read": {
        if (args.length !== 1) { throw new Error("usage: read <file.svg>"); }
        return this.session.read(args[0]);
      }

      case "save": {
        this.session.getDocument();
        if (args.length > 1) { throw new Error("usage: save [file.svg]"); }
        return this.session.save(args[0]);
      }

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
        this.session.getDocument();
        if (args.length < 2) {
          throw new Error("usage: create <type> <id> [params...]");
        }

        const [type, id, ...params] = args;
        return this.session.createShape(type, id, params);
      }

      case "show": {
        this.session.getDocument();
        if (args.length !== 1) {
          throw new Error("usage: show <id>");
        }
        return this.session.showShape(args[0]);
      }

      case "tree": {
        this.session.getDocument();
        if (args.length > 1) { throw new Error("usage: tree [id]"); }
        return this.session.tree(args[0]);
      }

      case "set": {
        this.session.getDocument();
        if (args.length !== 3) {
          throw new Error("usage: set <id> <attr> <value>");
        }
        return this.session.setShapeAttribute(args[0], args[1], args[2]);
      }

      case "front":
      case "back": {
        this.session.getDocument();
        if (args.length !== 1) { throw new Error(`usage: ${command} <id>`); }
        return this.session.reorderShape(args[0], command === "front");
      }

      case "group": {
        this.session.getDocument();
        if (args.length < 2) { throw new Error("usage: group <newGid> <id1> [id2 ...]"); }
        return this.session.groupShapes(args[0], args.slice(1));
      }
      case "ungroup": {
        this.session.getDocument();
        if (args.length !== 1) { throw new Error("usage: ungroup <gid>"); }
        return this.session.ungroupShape(args[0]);
      }
      case "addto": {
        this.session.getDocument();
        if (args.length !== 2) { throw new Error("usage: addto <gid> <id>"); }
        return this.session.addTo(args[0], args[1]);
      }

      case "delete": {
        this.session.getDocument();
        if (args.length !== 1) {
          throw new Error("usage: delete <id>");
        }
        return this.session.deleteShape(args[0]);
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