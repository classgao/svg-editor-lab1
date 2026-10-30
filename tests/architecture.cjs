const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const files=[];
const visit=dir=>{for(const item of fs.readdirSync(dir,{withFileTypes:true})){
 const full=path.join(dir,item.name);if(item.isDirectory())visit(full);else if(full.endsWith(".ts"))files.push(full);
}};
visit("src");
for(const file of files){
 const source=fs.readFileSync(file,"utf8"), normalized=file.replace(/\\/g,"/");
 const classes=[...source.matchAll(/export (?:abstract )?class (\w+)/g)];
 assert.ok(classes.length<=1,file);
 if(classes.length)assert.equal(path.basename(file,".ts"),classes[0][1]);
 for(const match of source.matchAll(/(?:from\s*|import\s*\()["']([^"']+)["']/g)){
  const dependency=match[1];
  if(!dependency.startsWith(".")){
   if(normalized.startsWith("src/domain/")||normalized.startsWith("src/application/"))assert.fail(file+" imports "+dependency);
   continue;
  }
  const target=path.resolve(path.dirname(file),dependency).replace(/\\/g,"/");
  if(normalized.startsWith("src/domain/"))assert.ok(target.includes("/src/domain/"),file+" -> "+dependency);
  if(normalized.startsWith("src/application/"))assert.ok(!/\/src\/(cli|infrastructure)\//.test(target),file+" -> "+dependency);
  if(normalized.startsWith("src/cli/"))assert.ok(!/\/src\/(domain|infrastructure)\//.test(target),file+" -> "+dependency);
  if(normalized.startsWith("src/infrastructure/")&&target.includes("/src/application/")){
   assert.ok(target.includes("/application/ports/")||target.endsWith("/application/ShapeFactory"),file+" -> "+dependency);
  }
 }
 if(/\bswitch\s*\(/.test(source)){
  assert.ok(["src/cli/CommandDispatcher.ts","src/application/ShapeFactory.ts"].includes(normalized),file);
 }
}
console.log("Architecture checks passed: "+files.length+" files, class filenames, dependencies and switch locations.");
