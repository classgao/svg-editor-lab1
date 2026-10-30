import { SvgDocument } from "../../domain/SvgDocument";

export interface DocumentStore {
  read(path: string): { document: SvgDocument; warnings: string[] };
  save(document: SvgDocument, path: string): void;
}
