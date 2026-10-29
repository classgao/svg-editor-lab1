import { EditorSession } from "./application/EditorSession";
import { CommandDispatcher } from "./cli/CommandDispatcher";
import { Repl } from "./cli/Repl";

const session = new EditorSession();
const dispatcher = new CommandDispatcher(session);
const repl = new Repl(dispatcher);

repl.start();