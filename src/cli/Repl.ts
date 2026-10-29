import * as readline from "node:readline";

export class Repl {
  public start(): void {
    const terminal = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "svg> ",
    });

    console.log("svg-editor 0.1 — type 'help' for commands");
    terminal.prompt();

    terminal.on("line", (line: string) => {
      this.handleLine(line);
      terminal.prompt();
    });

    terminal.on("close", () => {
      console.log("bye");
    });
  }

  private handleLine(line: string): void {
    const input = line.trim();

    if (input.length === 0 || input.startsWith("#")) {
      return;
    }

    if (input === "help") {
      console.log("当前已实现：");
      console.log("  help    显示帮助");
      console.log("  Ctrl+C  退出程序");
      return;
    }

    console.log(`error: unknown command: ${input}`);
  }
}