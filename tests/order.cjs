const assert = require("node:assert/strict");
const { EditorSession } = require("../dist/application/EditorSession.js");
const { CommandDispatcher } = require("../dist/cli/CommandDispatcher.js");
const { CommandParser } = require("../dist/cli/CommandParser.js");

for (const nested of [false, true]) {
  const session = new EditorSession();
  const cli = new CommandDispatcher(session);
  const parser = new CommandParser();
  const run = line => cli.dispatch(parser.parse(line));
  assert.throws(() => run("front a"), /no document/);
  run("init");
  if (nested) { run("create g scene"); }
  const suffix = nested ? " in scene" : "";
  run("create rect a 0 0 10 10" + suffix);
  run("create g b" + suffix);
  run("create text label 1 2 hello in b");
  run("create circle c 5 5 2" + suffix);
  const doc = session.getDocument();
  const ids = () => (nested ? doc.getContainer("scene").getChildren() : doc.getShapes()).map(s => s.getId());
  const before = run("tree");
  const group = doc.getShape("b");
  const label = doc.getShape("label");
  assert.deepEqual(ids(), ["a","b","c"]);
  run("front b");
  assert.deepEqual(ids(), ["a","c","b"]);
  assert.equal(doc.getShape("b"), group);
  assert.equal(doc.getShape("label"), label);
  assert.equal(doc.getParentId("b"), nested ? "scene" : undefined);
  assert.equal(doc.getParentId("label"), "b");
  const front = run("tree");
  for (let i=0;i<3;i++) {
    run("undo"); assert.equal(run("tree"), before);
    run("redo"); assert.equal(run("tree"), front);
  }
  run("back b");
  assert.deepEqual(ids(), ["b","a","c"]);
  run("undo"); assert.equal(run("tree"),front);
  for (const bad of ["front missing","back missing","front","back b extra"]) {
    assert.throws(() => run(bad)); assert.equal(run("tree"),front);
  }
  run("redo"); assert.deepEqual(ids(),["b","a","c"]);
  run("undo");
  run("move b 10 0");
  assert.throws(() => run("redo"),/nothing to redo/);
  run("undo");
  assert.equal(run("tree"),front);
  run("front b"); // Successful no-op is still one edit unit.
  run("undo"); assert.equal(run("tree"),front);
  run("undo"); assert.equal(run("tree"),before);
  run("front label"); // Only child: no membership or geometry changes.
  assert.equal(run("tree"),before);
  run("undo"); assert.equal(run("tree"),before);
  run("delete b"); run("undo"); assert.equal(run("tree"),before);
  run("canvas 400 300");
  assert.throws(() => run("back missing"));
  assert.throws(() => run("undo"),/undo not allowed/);
  run("back c"); assert.deepEqual(ids(),["c","a","b"]);
  run("undo"); assert.deepEqual(ids(),["a","b","c"]);
  assert.throws(() => run("undo"),/nothing to undo/);
}
console.log("Order checks passed: root/nested siblings, subtree identity, errors and undo/redo.");
