const { app, BrowserWindow, ipcMain, safeStorage } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const https = require('https');
const crypto = require('crypto');

let server;
let mainWindow;
let appUrl = '';
const CREDENTIALS_KEY = 'famiglia-login-credentials';
function credentialsPath() { return path.join(app.getPath('userData'), CREDENTIALS_KEY + '.bin'); }
ipcMain.handle('credentials:save', async (_event, payload) => {
  if (!safeStorage.isEncryptionAvailable()) return false;
  const email = String(payload?.email || '').trim().toLowerCase();
  const password = String(payload?.password || '');
  if (!email || !password) return false;
  fs.writeFileSync(credentialsPath(), safeStorage.encryptString(JSON.stringify({ email, password })));
  return true;
});
ipcMain.handle('credentials:load', async () => {
  try {
    if (!safeStorage.isEncryptionAvailable()) return null;
    const data = JSON.parse(safeStorage.decryptString(fs.readFileSync(credentialsPath())));
    return data?.email && data?.password ? { email: String(data.email), password: String(data.password) } : null;
  } catch { return null; }
});
ipcMain.handle('credentials:clear', async () => {
  try { fs.unlinkSync(credentialsPath()); } catch {}
  return true;
});
const MIME = {
  '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg',
  '.jpeg':'image/jpeg','.ico':'image/x-icon','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2'
};

function extractInviteToken(value) {
  if (!value || typeof value !== 'string') return '';
  const match = value.match(/^famiglia:\/\/invite\/([^/?#]+)/i);
  return match ? decodeURIComponent(match[1]) : '';
}

function extractInviteFromArgs(args) {
  return args.map(extractInviteToken).find(Boolean) || '';
}

const initialInviteToken = extractInviteFromArgs(process.argv);
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    const token = extractInviteFromArgs(commandLine);
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      if (token && appUrl) {
        mainWindow.loadURL(`${appUrl}?invite=${encodeURIComponent(token)}`);
      }
    }
  });
}

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
  appUrl=`http://127.0.0.1:${port}/`;
  mainWindow=new BrowserWindow({
    width:1440,height:900,minWidth:1024,minHeight:700,
    backgroundColor:'#fafaf9',
    webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,preload:path.join(__dirname,'preload.cjs')}
  });
  mainWindow.removeMenu();
  const invite = initialInviteToken ? `?invite=${encodeURIComponent(initialInviteToken)}` : '';
  await mainWindow.loadURL(appUrl + invite);
}

app.whenReady().then(async()=>{
  app.setAsDefaultProtocolClient('famiglia');
  await createWindow();
  app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0) createWindow();});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin') app.quit();});
app.on('before-quit',()=>{if(server) server.close();});

function isAllowedInstallerUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:'
      && parsed.hostname === 'github.com'
      && /^\/ImFakedream99\/app-famiglia\/releases\/download\/[^/]+\/Famiglia-Installer-[^/]+\.exe$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

function downloadFile(url, destination, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('Troppi redirect durante il download dell\'aggiornamento.'));
    const transport = url.startsWith('https:') ? https : http;
    const request = transport.get(url, {
      headers: { 'User-Agent': 'Famiglia-Updater' },
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        const nextUrl = new URL(response.headers.location, url).toString();
        return resolve(downloadFile(nextUrl, destination, redirects + 1));
      }
      if (response.statusCode !== 200) {
        response.resume();
        return reject(new Error('Download aggiornamento fallito: HTTP ' + response.statusCode));
      }

      const contentType = String(response.headers['content-type'] || '').toLowerCase();
      if (contentType.includes('text/html') || contentType.includes('application/json')) {
        response.resume();
        return reject(new Error('Il download non ha restituito un installer Windows valido.'));
      }

      const file = fs.createWriteStream(destination);
      const hash = crypto.createHash('sha256');
      response.on('data', (chunk) => hash.update(chunk));
      response.pipe(file);

      const fail = (error) => {
        try { file.destroy(); } catch {}
        try { fs.unlinkSync(destination); } catch {}
        reject(error);
      };

      file.on('finish', () => {
        file.close((error) => {
          if (error) return fail(error);
          if (!fs.existsSync(destination) || fs.statSync(destination).size === 0) {
            return fail(new Error('Installer scaricato vuoto.'));
          }
          resolve({ path: destination, sha256: hash.digest('hex') });
        });
      });
      file.on('error', fail);
      response.on('error', fail);
    });
    request.setTimeout(10 * 60 * 1000, () => request.destroy(new Error('Timeout durante il download dell\'aggiornamento.')));
    request.on('error', reject);
  });
}

ipcMain.handle('update:download-install', async (_event, url) => {
  const updateUrl = String(url || '').trim();
  if (!isAllowedInstallerUrl(updateUrl)) {
    throw new Error('URL aggiornamento non valido.');
  }

  const installerPath = path.join(
    app.getPath('temp'),
    `Famiglia-Update-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.exe`,
  );

  const downloaded = await downloadFile(updateUrl, installerPath);
  if (!downloaded?.path || !fs.existsSync(downloaded.path)) {
    throw new Error('Installer aggiornamento non disponibile.');
  }

  const child = spawn(downloaded.path, ['/S'], {
    detached: true,
    stdio: 'ignore',
    windowsHide: false,
  });
  child.unref();

  setTimeout(() => app.quit(), 1000);
  return true;
});
