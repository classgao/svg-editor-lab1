const assert=require("node:assert/strict"), fs=require("node:fs"), path=require("node:path"), os=require("node:os");
const {spawnSync}=require("node:child_process");
const {DOMParser}=require("@xmldom/xmldom");
const {EditorSession}=require("../dist/application/EditorSession.js");
const {CommandDispatcher}=require("../dist/cli/CommandDispatcher.js");
const {CommandParser}=require("../dist/cli/CommandParser.js");
const parser=new CommandParser();
assert.deepEqual(parser.parse('create text t 1 2 "My Diagram"'),["create","text","t","1","2","My Diagram"]);
assert.deepEqual(parser.parse('set t text ""'),["set","t","text",""]);
assert.deepEqual(parser.parse(" # comment"),[]);
assert.deepEqual(parser.parse("  "),[]);
assert.deepEqual(parser.parse("set r fill #ffffff"),["set","r","fill","#ffffff"]);
assert.throws(()=>parser.parse('set t text "unfinished'),/unterminated/);
const cli=new CommandDispatcher(new EditorSession());
for(const command of ["create","canvas","save","show","tree","set","front","back","group","ungroup","addto","delete","move","scale","undo","redo"]){
 assert.throws(()=>cli.dispatch([command]),/no document/);
}
assert.ok(cli.dispatch(["help"]).includes("read"));
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"svg-acceptance-"));
try{
 const output=path.join(dir,"flowchart.svg");
 const script=[
 "init 800 600","create g flowchart","create g node1 in flowchart",
 "create rect start 120 100 160 60 #4a90d9 in node1",
 'create text start-label 155 135 "\u5f00\u59cb" in node1',
 "create g node2 in flowchart","create rect process 520 100 160 60 #f5a623 in node2",
 'create text process-label 545 135 "\u5904\u7406\u6570\u636e" in node2',
 "create line arrow1 280 130 520 130 black in flowchart",
 "move node2 0 100","undo",
 'set process-label text "\u5904\u7406\u6570\u636e v2"',
 `save "${output}"`,"undo",`read "${output}"`,"tree","show process-label",
 "create box unsupported 0 0 10 10 title"
 ].join("\n")+"\n";
 const result=spawnSync(process.execPath,["dist/main.js"],{input:script,encoding:"utf8"});
 assert.equal(result.status,0,result.stderr);
 assert.ok(result.stdout.includes("error: undo not allowed after io command"));
 assert.ok(result.stdout.includes("error: unknown shape type: box"));
 assert.ok(result.stdout.includes("parent=g#node2"));
 const dom=new DOMParser().parseFromString(fs.readFileSync(output,"utf8"),"image/svg+xml");
 assert.equal(dom.getElementsByTagName("g").length,3);
 assert.equal(dom.getElementsByTagName("rect").length,2);
 assert.equal(dom.getElementsByTagName("text").length,2);
 assert.equal(dom.getElementsByTagName("line").length,1);
 assert.equal(dom.getElementById("process").getAttribute("y"),"100");
 assert.equal(dom.getElementById("process-label").textContent,"\u5904\u7406\u6570\u636e v2");
 const fresh=spawnSync(process.execPath,["dist/main.js"],{input:'init\ncreate text t 1 2 "oops\nhelp\n',encoding:"utf8"});
 assert.equal(fresh.status,0);
 assert.ok(fresh.stdout.includes("error: unterminated double quote"));
 assert.ok(fresh.stdout.includes("save [file.svg]"));
 console.log("Acceptance passed: parser, no-document rules, real UTF-8 CLI, flowchart and XML round trip.");
}finally{
 for(const name of fs.readdirSync(dir))fs.unlinkSync(path.join(dir,name));
 fs.rmdirSync(dir);
}
