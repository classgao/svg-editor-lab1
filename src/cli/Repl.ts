import * as readline from "node:readline";
import { CommandParser } from "./CommandParser";
import { CommandDispatcher } from "./CommandDispatcher";

export class Repl {
  private readonly parser = new CommandParser();

  public constructor(
    private readonly dispatcher: CommandDispatcher
  ) {}

  public start(): void {
    const terminal = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "svg> ",
    });

    console.log("svg-editor 0.1 — type 'help' for commands");
    terminal.prompt();

    terminal.on("line", (line: string) => {
      try {
        this.handleLine(line);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "unexpected error";

        console.log(`error: ${message}`);
      }

      terminal.prompt();
    });

    terminal.on("close", () => {
      console.log("bye");
    });
  }

  private handleLine(line: string): void {
    const tokens = this.parser.parse(line);

    if (tokens.length === 0) {
      return;
    }

    console.log(this.dispatcher.dispatch(tokens));
  }
}