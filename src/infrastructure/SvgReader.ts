import { DOMParser, Element, Node } from "@xmldom/xmldom";
import { SvgDocument } from "../domain/SvgDocument";
import { ShapeFactory } from "../application/ShapeFactory";

export class SvgReader {
  private readonly factory = new ShapeFactory();

  public parse(xml: string): { document: SvgDocument; warnings: string[] } {
    const dom = new DOMParser({ onError: (_level, message) => { throw new Error(message); } })
      .parseFromString(xml, "image/svg+xml");
    if (dom.doctype !== null) { throw new Error("DOCTYPE is not supported"); }
    const root = dom.documentElement;
    if (root === null || root.localName !== "svg") { throw new Error("expected svg root"); }
    this.checkNamespace(root);
    const attrs = this.attributes(root);
    for (const name of Object.keys(attrs)) {
      if (!["width", "height", "viewBox", "xmlns", "id"].includes(name) && !name.startsWith("xmlns:")) {
        throw new Error(`unsupported svg attribute: ${name}`);
      }
    }
    const width = this.dimension(attrs.width ?? "800");
    const height = this.dimension(attrs.height ?? "600");
    if (attrs.viewBox !== undefined) {
      const box = attrs.viewBox.trim().split(/[\s,]+/).map(Number);
      if (box.length !== 4 || box.some((n, i) => n !== [0, 0, width, height][i])) {
        throw new Error("unsupported viewBox: expected 0 0 width height");
      }
    }
    const document = new SvgDocument(width, height);
    const elements: Element[] = [];
    const collect = (element: Element): void => {
      this.checkNamespace(element);
      elements.push(element);
      this.children(element).forEach(collect);
    };
    this.children(root).forEach(collect);
    const ids = new Set<string>();
    if (attrs.id !== undefined && attrs.id.trim() !== "") { ids.add(attrs.id); }
    for (const element of elements) {
      const id = element.getAttribute("id");
      if (id !== null && id.trim() !== "") {
        if (ids.has(id)) { throw new Error(`id already exists: ${id}`); }
        ids.add(id);
      }
    }
    const warnings: string[] = [];
    const append = (element: Element, parentId?: string): void => {
      const attributes = this.attributes(element);
      let id = attributes.id;
      const type = element.localName ?? element.tagName;
      if (id === undefined || id.trim() === "") {
        let index = 1;
        while (ids.has(type + index)) { index++; }
        id = type + index;
        ids.add(id);
        warnings.push(`warning: assigned id ${id} to unnamed <${type}>`);
      }
      const shape = this.factory.fromAttributes(type, id, attributes, this.directText(element));
      document.addShape(shape, undefined, parentId);
      this.children(element).forEach(child => append(child, id));
    };
    if (this.directText(root).trim() !== "") { throw new Error("unexpected text in svg"); }
    this.children(root).forEach(element => append(element));
    return { document, warnings };
  }

  private dimension(value: string): number {
    const number = Number(value);
    if (value.trim() === "" || !Number.isFinite(number)) { throw new Error("invalid canvas dimension"); }
    return number;
  }

  private checkNamespace(element: Element): void {
    if (element.namespaceURI !== null && element.namespaceURI !== "" &&
      element.namespaceURI !== "http://www.w3.org/2000/svg") {
      throw new Error("unsupported namespace");
    }
  }

  private attributes(element: Element): Record<string, string> {
    const result: Record<string, string> = Object.create(null);
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes.item(i)!;
      result[attr.name] = attr.value;
    }
    return result;
  }

  private children(element: Element): Element[] {
    const result: Element[] = [];
    for (let i = 0; i < element.childNodes.length; i++) {
      const node = element.childNodes.item(i)!;
      if (node.nodeType === 1) { result.push(node as Element); }
    }
    return result;
  }

  private directText(element: Element): string {
    let result = "";
    for (let i = 0; i < element.childNodes.length; i++) {
      const node: Node = element.childNodes.item(i)!;
      if (node.nodeType === 3 || node.nodeType === 4) { result += node.nodeValue ?? ""; }
    }
    return result;
  }
}
