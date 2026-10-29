export class CommandParser {
  public parse(line: string): string[] {
    const input = line.trim();

    if (input.length === 0 || input.startsWith("#")) {
      return [];
    }

    const tokens: string[] = [];
    let current = "";
    let inQuotes = false;
    let tokenStarted = false;

    for (const character of input) {
      if (character === '"') {
        inQuotes = !inQuotes;
        tokenStarted = true;
        continue;
      }

      if (/\s/.test(character) && !inQuotes) {
        if (tokenStarted) {
          tokens.push(current);
          current = "";
          tokenStarted = false;
        }
        continue;
      }

      current += character;
      tokenStarted = true;
    }

    if (inQuotes) {
      throw new Error("unterminated double quote");
    }

    if (tokenStarted) {
      tokens.push(current);
    }

    return tokens;
  }
}