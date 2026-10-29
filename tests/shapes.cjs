const assert = require("node:assert/strict");
const { EditorSession } = require("../dist/application/EditorSession.js");
const { CommandDispatcher } = require("../dist/cli/CommandDispatcher.js");
const cases = [
  { type:"circle", coords:["10","20","3"], geometry:"cx=10 cy=20 r=3",
    moved:"cx=15 cy=13 r=3", scaled:"cx=20 cy=40 r=6",
    attrs:["cx","cy","r"], radii:["r"], style:"fill" },
  { type:"ellipse", coords:["10","20","3","4"], geometry:"cx=10 cy=20 rx=3 ry=4",
    moved:"cx=15 cy=13 rx=3 ry=4", scaled:"cx=20 cy=40 rx=6 ry=8",
    attrs:["cx","cy","rx","ry"], radii:["rx","ry"], style:"fill" },
  { type:"line", coords:["10","20","30","40"], geometry:"x1=10 y1=20 x2=30 y2=40",
    moved:"x1=15 y1=13 x2=35 y2=33", scaled:"x1=20 y1=40 x2=60 y2=80",
    attrs:["x1","y1","x2","y2"], radii:[], style:"stroke" }
];
for (const c of cases) {
  const session = new EditorSession();
  const cli = new CommandDispatcher(session);
  const run = (...args) => cli.dispatch(args);
  run("init");
  for (const coords of [[], c.coords.slice(1), [...c.coords,"red","extra"]]) {
    assert.throws(() => run("create",c.type,"bad",...coords), /usage:/);
    assert.equal(session.getDocument().getShapes().length,0);
  }
  assert.throws(() => run("create",c.type,"bad","Infinity",...c.coords.slice(1)), /invalid number/);
  assert.throws(() => run("undo"),/undo not allowed/);
  run("create",c.type,"s",...c.coords);
  const shape = session.getDocument().getShape("s");
  const original = `${c.type}#s  parent=svg\n  ${c.geometry}`;
  assert.equal(run("show","s"),original);
  assert.ok(run("tree").includes(shape.describe()));
  run("move","s","5","-7");
  assert.ok(run("show","s").includes(c.moved));
  run("undo");
  assert.equal(run("show","s"),original);
  run("scale","s","2");
  assert.ok(run("show","s").includes(c.scaled));
  for(let i=0;i<3;i++){
    run("undo"); assert.equal(run("show","s"),original);
    run("redo"); assert.ok(run("show","s").includes(c.scaled));
  }
  run("undo");
  for(const factor of ["0","-1","1e308"]){
    assert.throws(()=>run("scale","s",factor));
    assert.equal(run("show","s"),original);
  }
  assert.throws(()=>run("set","s","width","5"),/unknown attribute/);
  for(const attr of c.radii){
    assert.throws(()=>run("set","s",attr,"-1"),/non-negative/);
    assert.equal(run("show","s"),original);
    const coords=[...c.coords]; coords[c.attrs.indexOf(attr)]="-1";
    assert.throws(()=>run("create",c.type,"bad",...coords),/non-negative/);
  }
  run("redo"); assert.ok(run("show","s").includes(c.scaled));
  run("undo");
  for(const attr of c.attrs){
    run("set","s",attr,"0.25");
    assert.ok(run("show","s").includes(attr+"=0.25"));
    run("undo"); assert.equal(run("show","s"),original);
  }
  for(const attr of ["fill","stroke","stroke-width"]){
    run("set","s",attr,attr==="stroke-width"?"2":"red");
    assert.ok(run("show","s").includes(attr+"="));
    run("undo"); assert.equal(run("show","s"),original);
  }
  run("create",c.type,"styled",...c.coords,"blue");
  assert.ok(run("show","styled").includes(c.style+"=blue"));
  assert.throws(()=>run("create","rect","s","0","0","1","1"),/id already exists/);
  run("delete","s"); run("undo");
  assert.equal(session.getDocument().getShape("s"),shape);
  assert.deepEqual(session.getDocument().getShapes().map(x=>x.getId()),["s","styled"]);
  run("set","s",c.attrs[0],"0.1");
  const fractional=run("show","s");
  run("move","s","0.2","0.2"); run("undo");
  assert.equal(run("show","s"),fractional);
  run("set","s",c.attrs[0],"1e308");
  const large=run("show","s");
  assert.throws(()=>run("move","s","1e308","1e308"),/finite/);
  assert.equal(run("show","s"),large);
}
console.log("Shape checks passed: circle, ellipse, line, geometry, styles and history.");
