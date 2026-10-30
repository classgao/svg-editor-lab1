import { SvgDocument } from "../../domain/SvgDocument";

export interface DocumentStore {
  save(document: SvgDocument, path: string): void;
}
