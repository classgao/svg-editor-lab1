const assert = require("node:assert/strict");
const { EditorSession } = require("../dist/application/EditorSession.js");
const { CommandDispatcher } = require("../dist/cli/CommandDispatcher.js");
const { CommandParser } = require("../dist/cli/CommandParser.js");
const session = new EditorSession();
const cli = new CommandDispatcher(session);
const parser = new CommandParser();
const run = line => cli.dispatch(parser.parse(line));
assert.throws(() => run("set r1 x 1"), /no document/);
run("init");
run("create rect r1 0.1 20 100 50");
const shape = session.getDocument().getShape("r1");
const original = shape.describe();
for (const [attr, value, output] of [
  ["x", "-3.5", "x=-3.5"], ["y", "0", "y=0"],
  ["width", "0", "w=0"], ["height", "0.5", "h=0.5"],
  ["fill", "#ffffff", "fill=#ffffff"], ["stroke", "blue", "stroke=blue"],
  ["stroke-width", "2.5", "stroke-width=2.5"]
]) {
  run(`set r1 ${attr} ${value}`);
  assert.ok(shape.describe().includes(output));
  const changed = shape.describe();
  for (let i=0;i<3;i++) {
    run("undo");
    assert.equal(shape.describe(),original);
    run("redo");
    assert.equal(shape.describe(),changed);
  }
  run("undo");
}
for (const command of [
  "set r1 id other", "set r1 text nope", "set r1 cx 10",
  "set r1 __proto__ nope", "set r1 constructor nope",
  "set r1 width -1", "set r1 height -1", "set r1 x Infinity",
  'set r1 y ""', "set r1 width NaN", "set r1 stroke-width -1",
  "set r1 stroke-width Infinity", 'set r1 stroke-width ""',
  "set missing x 1", "set r1 x", "set r1 x 1 extra"
]) {
  assert.throws(() => run(command));
  assert.equal(shape.describe(),original);
}
// Failed edits retained the last successful edit's redo entry.
run("redo");
assert.ok(shape.describe().includes("stroke-width=2.5"));
run("undo");
assert.equal(shape.describe(),original);
run('set r1 fill "rgb(10, 20, 30)"');
assert.ok(shape.describe().includes("fill=rgb(10, 20, 30)"));
assert.throws(() => run("redo"),/nothing to redo/);
run("set r1 fill red");
run("undo");
assert.ok(shape.describe().includes("fill=rgb(10, 20, 30)"));
run("undo");
assert.equal(shape.describe(),original);
run("set r1 stroke-width 0");
run("scale r1 2");
assert.ok(shape.describe().includes("stroke-width=0"));
run("undo");
run("undo");
assert.equal(shape.describe(),original);
run("canvas 400 300");
assert.throws(() => run("set r1 width -1"));
assert.throws(() => run("undo"), /undo not allowed/);
run("set r1 fill red");
run("delete r1");
run("undo");
assert.equal(session.getDocument().getShape("r1"),shape);
assert.ok(shape.describe().includes("fill=red"));
run("undo");
assert.equal(shape.describe(),original);
assert.throws(() => run("undo"), /nothing to undo/);
console.log("Set checks passed: whitelist, styles, exact undo, failures and history.");
