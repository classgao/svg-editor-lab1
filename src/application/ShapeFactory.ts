import { Circle } from "../domain/shapes/Circle";
import { Ellipse } from "../domain/shapes/Ellipse";
import { Line } from "../domain/shapes/Line";
import { Shape } from "../domain/shapes/Shape";
import { Rectangle } from "../domain/shapes/Rectangle";

export class ShapeFactory {
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