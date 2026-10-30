import { Group } from "../domain/shapes/Group";
import { Text } from "../domain/shapes/Text";
import { Circle } from "../domain/shapes/Circle";
import { Ellipse } from "../domain/shapes/Ellipse";
import { Line } from "../domain/shapes/Line";
import { Shape } from "../domain/shapes/Shape";
import { Rectangle } from "../domain/shapes/Rectangle";

export class ShapeFactory {
  public fromAttributes(type: string, id: string, attributes: Readonly<Record<string, string>>, text: string): Shape {
    const geometry: Record<string, string[]> = {
      rect: ["x", "y", "width", "height"], circle: ["cx", "cy", "r"],
      ellipse: ["cx", "cy", "rx", "ry"], line: ["x1", "y1", "x2", "y2"],
      text: ["x", "y"], g: []
    };
    if (!Object.prototype.hasOwnProperty.call(geometry, type)) {
      throw new Error(`unknown shape type: ${type} (is the plugin loaded?)`);
    }
    const params = geometry[type].map(name => attributes[name] ?? "0");
    if (type === "text") { params.push(text); }
    const shape = this.create(type, id, params);
    for (const [key, value] of Object.entries(attributes)) {
      if (key === "id" || key === "xmlns" || key.startsWith("xmlns:") || key === "data-kind") { continue; }
      shape.setAttribute(key, value);
    }
    if (type !== "text" && text.trim() !== "") { throw new Error("unexpected text content"); }
    return shape;
  }

  public splitParent(type: string, params: string[]): { params: string[]; parentId?: string } {
    // Text content can literally be "in"; a suffix must follow all required parameters.
    const minimum = type === "text" ? 5 : 2;
    if (params.length >= minimum && params[params.length - 2] === "in") {
      return { params: params.slice(0, -2), parentId: params[params.length - 1] };
    }
    return { params: [...params] };
  }

  public create(type: string, id: string, params: string[]): Shape {
    switch (type) {
      case "rect": {
        if (params.length !== 4 && params.length !== 5) {
          throw new Error("usage: create rect <id> <x> <y> <w> <h> [fill]");
        }

        return new Rectangle(
          id,
          this.parseNumber(params[0]),
          this.parseNumber(params[1]),
          this.parseNumber(params[2]),
          this.parseNumber(params[3]),
          params[4]
        );
      }

      case "circle": {
        if (params.length !== 3 && params.length !== 4) {
          throw new Error("usage: create circle <id> <cx> <cy> <r> [fill]");
        }
        return new Circle(
          id,
          this.parseNumber(params[0]),
          this.parseNumber(params[1]),
          this.parseNumber(params[2]),
          params[3]
        );
      }

      case "ellipse": {
        if (params.length !== 4 && params.length !== 5) {
          throw new Error("usage: create ellipse <id> <cx> <cy> <rx> <ry> [fill]");
        }
        return new Ellipse(
          id,
          this.parseNumber(params[0]),
          this.parseNumber(params[1]),
          this.parseNumber(params[2]),
          this.parseNumber(params[3]),
          params[4]
        );
      }

      case "line": {
        if (params.length !== 4 && params.length !== 5) {
          throw new Error("usage: create line <id> <x1> <y1> <x2> <y2> [stroke]");
        }
        return new Line(
          id,
          this.parseNumber(params[0]),
          this.parseNumber(params[1]),
          this.parseNumber(params[2]),
          this.parseNumber(params[3]),
          params[4]
        );
      }

      case "text": {
        if (params.length !== 3) {
          throw new Error('usage: create text <id> <x> <y> "content"');
        }
        return new Text(id, this.parseNumber(params[0]), this.parseNumber(params[1]), params[2]);
      }

      case "g":
        if (params.length !== 0) { throw new Error("usage: create g <id>"); }
        return new Group(id);

      default:
        throw new Error(
          `unknown shape type: ${type} (is the plugin loaded?)`
        );
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