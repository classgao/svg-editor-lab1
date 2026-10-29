const assert = require("node:assert/strict");
const { EditorSession } = require("../dist/application/EditorSession.js");
const { CommandDispatcher } = require("../dist/cli/CommandDispatcher.js");
const { CommandParser } = require("../dist/cli/CommandParser.js");
const session = new EditorSession();
const cli = new CommandDispatcher(session);
const parser = new CommandParser();
const run = line => cli.dispatch(parser.parse(line));
run("init");
for(const cmd of ['create text t 10 20','create text t 10 20 a b','create text t NaN 20 a']){
  assert.throws(()=>run(cmd));
  assert.equal(session.getDocument().getShapes().length,0);
}
run('create text t 0.1 20 "My Diagram"');
const shape=session.getDocument().getShape("t");
const original=run("show t");
assert.equal(shape.describe(),'text#t (0.1,20) "My Diagram"');
assert.ok(original.includes('text="My Diagram"'));
run("move t 0.2 -10"); assert.ok(shape.describe().includes('(0.30000000000000004,10)'));
run("undo"); assert.equal(run("show t"),original);
run("scale t 2"); assert.equal(shape.describe(),'text#t (0.2,40) "My Diagram"');
run("undo"); assert.equal(run("show t"),original);
for(const value of ["", "  leading and trailing  ", "#not a comment", "\u5f00\u59cb & <end> \ud83d\ude80", 'a "quote" and \\']) {
  cli.dispatch(["set","t","text",value]);
  const updated=run("show t");
  assert.ok(updated.includes("text="+JSON.stringify(value)));
  for(let i=0;i<3;i++){
    run("undo"); assert.equal(run("show t"),original);
    run("redo"); assert.equal(run("show t"),updated);
  }
  run("undo");
}
for(const cmd of ['set t width 3','set t font-size 16','set t x ""','set t y Infinity','scale t 0','scale t 1e308']){
  assert.throws(()=>run(cmd));
  assert.equal(run("show t"),original);
}
run("redo"); assert.notEqual(run("show t"),original);
run("undo");
run('set t text ""'); assert.ok(run("show t").includes('text=""'));
run("undo"); assert.equal(run("show t"),original);
run('create text empty 0 0 ""');
assert.equal(session.getDocument().getShape("empty").describe(),'text#empty (0,0) ""');
run("set t fill red"); run("set t stroke blue"); run("set t stroke-width 2");
const styled=run("show t");
run('set t text "Updated text"'); run("move t 10 10"); run("scale t 2");
run("undo"); run("undo"); run("undo"); assert.equal(run("show t"),styled);
run("set t x -2.5"); assert.ok(run("show t").includes("x=-2.5"));run("undo");
run("set t y 0"); assert.ok(run("show t").includes("y=0"));run("undo");
run("delete t"); run("undo");
assert.equal(session.getDocument().getShape("t"),shape);
assert.equal(run("show t"),styled);
assert.deepEqual(session.getDocument().getShapes().map(s=>s.getId()),["t","empty"]);
run("canvas 400 300"); run("show t");
assert.throws(()=>run("undo"),/undo not allowed/);
assert.throws(()=>run("create rect t 0 0 1 1"),/id already exists/);
assert.throws(()=>run("undo"),/undo not allowed/);
console.log("Text checks passed: content, Unicode, empty strings, geometry and history.");
