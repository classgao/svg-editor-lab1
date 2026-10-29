import { Shape } from "../../domain/shapes/Shape";
import { EditCommand } from "./EditCommand";

export class SetAttributeCommand implements EditCommand {
  private restoreState: (() => void) | undefined;

  public constructor(
    private readonly shape: Shape,
    private readonly attr: string,
    private readonly value: string
  ) {}

  public execute(): string {
    const restore = this.shape.captureState();
    this.shape.setAttribute(this.attr, this.value);
    this.restoreState = restore;
    return `${this.shape.getType()}#${this.shape.getId()} updated: ${this.attr}=${this.value}`;
  }

  public undo(): string {
    if (this.restoreState === undefined) {
      throw new Error("cannot undo a command that has not executed");
    }
    this.restoreState();
    return `${this.shape.getType()}#${this.shape.getId()} restored`;
  }
}
