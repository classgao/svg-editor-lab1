const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),os=require("node:os");
const {SvgReader}=require("../dist/infrastructure/SvgReader.js");
const {SvgSerializer}=require("../dist/infrastructure/SvgSerializer.js");
const {EditorSession}=require("../dist/application/EditorSession.js");
const {FileDocumentStore}=require("../dist/infrastructure/FileDocumentStore.js");
const reader=new SvgReader(),serializer=new SvgSerializer();
const xml='<svg width="400" height="300"><rect width="10" height="20"/><g id="g1"><rect id="rect1" width="2" height="3"/><text id="t" x="1" y="2"> A &amp; &lt;B&gt; <![CDATA[ C ]]></text><circle cx="5" cy="6" r="2"/><ellipse cx="2" cy="3" rx="4" ry="5"/><line x1="0" y1="1" x2="2" y2="3"/></g></svg>';
const result=reader.parse(xml);
assert.ok(result.warnings.includes("warning: assigned id rect2 to unnamed <rect>"));
assert.equal(result.document.getParentId("t"),"g1");
assert.equal(result.document.getShape("t").getTextContent()," A & <B>  C ");
const saved=serializer.serialize(result.document);
assert.equal(serializer.serialize(reader.parse(saved).document),saved);
assert.equal(reader.parse(saved).warnings.length,0);
for(const bad of [
 '<svg><rect id="x"/><g id="x"/></svg>',
 '<svg><path id="p"/></svg>',
 '<svg><g transform="translate(1,2)"/></svg>',
 '<svg><g><rect></g></svg>',
 '<svg><text>&unknown;</text></svg>',
 '<svg><rect><circle/></rect></svg>',
 '<svg width="0"/>',
 '<svg width="400" height="300" viewBox="1 0 400 300"/>',
 '<!DOCTYPE svg [<!ENTITY x "test">]><svg/>',
 '<svg xmlns="urn:other"/>'
])assert.throws(()=>reader.parse(bad),bad);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"svg-read-"));
try{
 const good=path.join(dir,"source.svg"),bad=path.join(dir,"bad.svg");
 fs.writeFileSync(good,xml);fs.writeFileSync(bad,'<svg><rect id="same"/><rect id="same"/></svg>');
 const s=new EditorSession(new FileDocumentStore());
 assert.ok(s.read(good).includes("warning: assigned id rect2"));
 assert.throws(()=>s.undo(),/undo not allowed/);
 s.moveShape("rect2",5,0);s.undo();
 const before=s.tree();
 assert.throws(()=>s.read(bad),/id already exists/);
 assert.equal(s.tree(),before);
 assert.throws(()=>s.read(path.join(dir,"missing.svg")),/cannot read file/);
 s.redo();assert.ok(s.showShape("rect2").includes("x=5"));
 s.save();assert.ok(fs.readFileSync(good,"utf8").includes('x="5"'));
 assert.throws(()=>s.undo(),/undo not allowed/);
 const expected=s.tree();s.read(good);assert.equal(s.tree(),expected);
 s.init();assert.throws(()=>s.save(),/no file path/);
 console.log("Read checks passed: round trips, generated IDs, strict errors, paths and history.");
}finally{
 for(const name of fs.readdirSync(dir))fs.unlinkSync(path.join(dir,name));
 fs.rmdirSync(dir);
}
