const { app, BrowserWindow } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

let server;
const MIME = {
  '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg',
  '.jpeg':'image/jpeg','.ico':'image/x-icon','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2'
};

function startServer(root) {
  return new Promise((resolve,reject)=>{
    server=http.createServer((req,res)=>{
      const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      let file=path.join(root, pathname === '/' ? 'index.html' : pathname.replace(/^\//,''));
      if (!file.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file=path.join(root,'index.html');
      fs.readFile(file,(err,data)=>{
        if(err){res.writeHead(500);return res.end('Internal error');}
        res.writeHead(200,{'Content-Type':MIME[path.extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-cache'});
        res.end(data);
      });
    });
    server.on('error',reject);
    server.listen(0,'127.0.0.1',()=>resolve(server.address().port));
  });
}

async function createWindow() {
  const root=path.join(app.getAppPath(),'dist');
  const port=await startServer(root);
  const win=new BrowserWindow({
    width:1440,height:900,minWidth:1024,minHeight:700,
    backgroundColor:'#fafaf9',
    webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true}
  });
  win.removeMenu();
  await win.loadURL(`http://127.0.0.1:${port}/`);
}

app.whenReady().then(async()=>{
  await createWindow();
  app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0) createWindow();});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin') app.quit();});
app.on('before-quit',()=>{if(server) server.close();});
