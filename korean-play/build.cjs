const fs=require('node:fs/promises');
const {build}=require('esbuild');
(async()=>{await fs.mkdir('dist',{recursive:true});await build({entryPoints:['app.js'],outfile:'dist/app.js',bundle:true,minify:true,platform:'browser',target:['chrome110','edge110','safari16'],legalComments:'eof'});for(const f of ['index.html','style.css','questions.js'])await fs.copyFile(f,'dist/'+f);console.log('Built static app with pinned Supabase SDK.');})();
