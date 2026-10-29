const assert = require("node:assert/strict");
const { EditorSession } = require("../dist/application/EditorSession.js");
const { CommandDispatcher } = require("../dist/cli/CommandDispatcher.js");
const { Rectangle } = require("../dist/domain/shapes/Rectangle.js");
let checks = 0;
for (const id of ["r1", "r2", "r3"]) {
  const session = new EditorSession();
  const cli = new CommandDispatcher(session);
  assert.throws(() => cli.dispatch(["delete", id]), /no document/);
  cli.dispatch(["init"]);
  for (const name of ["r1", "r2", "r3"]) {
    cli.dispatch(["create", "rect", name, "10", "20", "100", "50", "red"]);
  }
  const doc = session.getDocument();
  const original = doc.getShapes();
  assert.equal(cli.dispatch(["delete", id]), `rect#${id} deleted`);
  assert.throws(() => doc.getShape(id), /no such shape/);
  for (let i = 0; i < 3; i++) {
    cli.dispatch(["undo"]);
    assert.deepEqual(doc.getShapes(), original);
    original.forEach(shape => assert.equal(doc.getShape(shape.getId()), shape));
    cli.dispatch(["redo"]);
    assert.deepEqual(doc.getShapes(), original.filter(shape => shape.getId() !== id));
  }
  cli.dispatch(["undo"]);
  assert.throws(() => cli.dispatch(["delete", "missing"]), /no such shape: missing/);
  assert.throws(() => cli.dispatch(["delete"]), /usage: delete/);
  assert.throws(() => cli.dispatch(["delete", id, "extra"]), /usage: delete/);
  cli.dispatch(["redo"]);
  assert.throws(() => doc.getShape(id), /no such shape/);
  cli.dispatch(["undo"]);
  cli.dispatch(["move", id, "5", "0"]);
  assert.throws(() => cli.dispatch(["redo"]), /nothing to redo/);
  cli.dispatch(["undo"]);
  assert.deepEqual(doc.getShapes(), original);

  const snapshot = doc.getShapes();
  for (const index of [-1, 0.5, 4, NaN]) {
    assert.throws(() => doc.addShape(new Rectangle("bad", 0, 0, 1, 1), index), /invalid shape insertion/);
    assert.deepEqual(doc.getShapes(), snapshot);
  }
  cli.dispatch(["canvas", "640", "480"]);
  assert.throws(() => cli.dispatch(["delete", "missing"]), /no such shape/);
  assert.throws(() => cli.dispatch(["undo"]), /undo not allowed/);
  cli.dispatch(["delete", id]);
  cli.dispatch(["undo"]);
  assert.deepEqual(doc.getShapes(), original);
  assert.throws(() => cli.dispatch(["undo"]), /nothing to undo/);
  cli.dispatch(["init"]);
  assert.equal(session.getDocument().getShapes().length, 0);
  assert.throws(() => cli.dispatch(["undo"]), /undo not allowed/);
  checks++;
}
console.log(`Delete checks passed for ${checks} positions, history and failure cases.`);
