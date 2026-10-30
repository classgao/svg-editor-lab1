import { SvgDocument } from "../domain/SvgDocument";
import { Shape } from "../domain/shapes/Shape";

export class SvgSerializer {
  public serialize(document: SvgDocument): string {
    const width = document.getWidth();
    const height = document.getHeight();
    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
      ...document.getShapes().map(shape => this.element(shape, 1)),
      "</svg>",
      ""
    ].join("\n");
  }

  private element(shape: Shape, depth: number): string {
    const indent = "  ".repeat(depth);
    const tag = shape.getType();
    const attrs = Object.entries(shape.getAttributes())
      .map(([key, value]) => `${key}="${this.escape(value)}"`).join(" ");
    const children = shape.getChildren();
    const content = shape.getTextContent();
    if (content !== undefined) {
      return `${indent}<${tag} ${attrs}>${this.escape(content)}</${tag}>`;
    }
    if (children.length === 0) { return `${indent}<${tag} ${attrs}/>`; }
    return [
      `${indent}<${tag} ${attrs}>`,
      ...children.map(child => this.element(child, depth + 1)),
      `${indent}</${tag}>`
    ].join("\n");
  }

  private escape(value: string): string {
    for (const character of value) {
      const code = character.codePointAt(0)!;
      if (!(code === 9 || code === 10 || code === 13 ||
        (code >= 32 && code <= 0xd7ff) ||
        (code >= 0xe000 && code <= 0xfffd) ||
        (code >= 0x10000 && code <= 0x10ffff))) {
        throw new Error("invalid XML character");
      }
    }
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&apos;")
      .replace(/\t/g, "&#9;").replace(/\n/g, "&#10;").replace(/\r/g, "&#13;");
  }
}
