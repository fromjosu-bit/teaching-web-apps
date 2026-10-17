const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const allowed=new Set(['index.html','style.css','questions.js','app.js']);
http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';if(!allowed.has(name)){res.writeHead(404);return res.end('Not found');}fs.readFile(path.join(root,name),(err,data)=>{if(err){res.writeHead(500);return res.end('Read error');}res.writeHead(200,{'Content-Type':types[path.extname(name)],'Cache-Control':'no-cache'});res.end(data);});}).listen(4173,'127.0.0.1',()=>console.log('말놀이 로컬 미리보기: http://127.0.0.1:4173'));
