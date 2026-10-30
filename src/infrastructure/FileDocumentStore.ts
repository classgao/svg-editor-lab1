import { writeFileSync, renameSync, unlinkSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { randomUUID } from "node:crypto";
import { DocumentStore } from "../application/ports/DocumentStore";
import { SvgDocument } from "../domain/SvgDocument";
import { SvgSerializer } from "./SvgSerializer";

export class FileDocumentStore implements DocumentStore {
  private readonly serializer = new SvgSerializer();

  public save(document: SvgDocument, path: string): void {
    const xml = this.serializer.serialize(document);
    const temporary = join(dirname(path), "." + basename(path) + "." + randomUUID() + ".tmp");
    try {
      writeFileSync(temporary, xml, { encoding: "utf8", flag: "wx" });
      renameSync(temporary, path);
    } finally {
      try { unlinkSync(temporary); } catch { /* File was renamed or never created. */ }
    }
  }
}
