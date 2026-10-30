import { FileDocumentStore } from "./infrastructure/FileDocumentStore";
import { EditorSession } from "./application/EditorSession";
import { CommandDispatcher } from "./cli/CommandDispatcher";
import { Repl } from "./cli/Repl";

const session = new EditorSession(new FileDocumentStore());
const dispatcher = new CommandDispatcher(session);
const repl = new Repl(dispatcher);

repl.start();