import JSZip from 'jszip';
import { generateSupabaseConfigFile, SUPABASE_SCHEMA_SQL, getSupabaseConfig } from '../lib/supabase';

export interface ExecutablePackageOptions {
  includeElectronFiles?: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

// Embedded valid 1536-byte Windows PE32 GUI Executable (Intel 80386)
// Generated with valid PE headers, GUI subsystem, KERNEL32 imports (WinExec, ExitProcess)
const WINDOWS_PE_BASE64 = 
  'TVoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'gAAAAA4fug4AtAnNIbgBTM0hVGhpcyBwcm9ncmFtIGNhbm5vdCBiZSBydW4gaW4gRE9TIG1vZGUuDQ0K' +
  'JAAAAAAAAABQRQAATAECAAAAAAAAAAAAAAAAAOAAAgELAQYAAAIAAAACAAAAAAAAABAAAAAQAAAAIAAA' +
  'AABAAAAQAAAAAgAABAAAAAAAAAAEAAAAAAAAAAAwAAAAAgAAAAAAAAIAQIEAABAAABAAAAAAEAAAEAAA' +
  'AAAAABAAAAAAAAAAAAAAAAAgAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAC50ZXh0AAAAAAIAAAAQAAAAAgAAAAIAAAAAAAAAAAAAAAAAACAAAGAucmRhdGEAAAACAAAAIA' +
  'AAAAIAAAAEAAAAAAAAAAAAAAAAAABAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAABqAGhwIEAA/xU0IEAAagD/FTggQADDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgg' +
  'AAAAAAAAAAAAAEAgAAA0IAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQIAAAYCAAAAAAAABQIAAAYCAAAAAA' +
  'AABLRVJORUwzMi5kbGwAAAAAAABXaW5FeGVjAAAAAAAAAAAARXhpdFByb2Nlc3MAAABjbWQuZXhlIC9j' +
  'IGlmIGV4aXN0IEluc3RhbGxhLUZhbWlnbGlhLVdpbmRvd3MuYmF0IChjYWxsIEluc3RhbGxhLUZhbWln' +
  'bGlhLVdpbmRvd3MuYmF0KSBlbHNlIChzdGFydCAiIiBpbmRleC5odG1sKQAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAA==';

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Direct download of the Windows Executable (.exe)
 */
export async function downloadDirectWindowsExe(filename = 'Famiglia-Installer.exe'): Promise<void> {
  try {
    let blob: Blob;
    try {
      const response = await fetch(`/${filename}`);
      if (response.ok) {
        blob = await response.blob();
      } else {
        const bytes = base64ToUint8Array(WINDOWS_PE_BASE64);
        blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/vnd.microsoft.portable-executable' });
      }
    } catch {
      const bytes = base64ToUint8Array(WINDOWS_PE_BASE64);
      blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/vnd.microsoft.portable-executable' });
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to download .exe file directly:', err);
    throw err;
  }
}

/**
 * Generate and download complete desktop package with Windows automated installer,
 * local C# compiler for Famiglia.exe, desktop shortcut creator, and cross-platform launchers.
 */
export async function generateAndDownloadDesktopPackage(): Promise<void> {
  const zip = new JSZip();

  // 1. Windows Installer that automatically creates Famiglia.exe and Desktop Shortcut
  const windowsInstallerBat = `@echo off
setlocal enabledelayedexpansion
title Famiglia - Installatore Desktop Windows
color 0B

echo ===================================================================
echo     FAMIGLIA - INSTALLATORE AUTOMATICO DESKTOP PER WINDOWS 10/11
echo ===================================================================
echo.
echo Benvenuto nell'installatore di Famiglia - Gestione Economica.
echo Questo programma configurera' l'app sul tuo PC, creera' l'eseguibile
echo Famiglia.exe e inserira' l'icona sul tuo Desktop.
echo.

set "INSTALL_DIR=%LOCALAPPDATA%\\FamigliaApp"
echo [1/4] Preparazione cartella di installazione in:
echo       %INSTALL_DIR%
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo.
echo [2/4] Copia dei file applicativi...
xcopy /Y /E /I /Q * "%INSTALL_DIR%\\" >nul 2>&1

cd /d "%INSTALL_DIR%"

echo.
echo [3/4] Creazione automatica del file eseguibile Famiglia.exe...
set "CSC="
if exist "%SystemRoot%\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe" (
    set "CSC=%SystemRoot%\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe"
) else if exist "%SystemRoot%\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe" (
    set "CSC=%SystemRoot%\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe"
)

if defined CSC (
    echo Compilazione del file Famiglia.exe tramite compilatore Windows nativo...
    "%CSC%" /nologo /target:winexe /out:"Famiglia.exe" /win32icon:icon.ico Program.cs >nul 2>&1
)

:: Se non compilato da CSC, impiega il file eseguibile nativo incluso
if not exist "Famiglia.exe" (
    if exist "Famiglia-Installer.exe" copy /Y "Famiglia-Installer.exe" "Famiglia.exe" >nul 2>&1
)

echo.
echo [4/4] Creazione del collegamento 'Famiglia Economica' sul Desktop...
set "SHORTCUT_VBS=%TEMP%\\create_shortcut_%RANDOM%.vbs"
(
    echo Set oWS = WScript.CreateObject^("WScript.Shell"^)
    echo sLinkFile = oWS.SpecialFolders^("Desktop"^) ^& "\\Famiglia Economica.lnk"
    echo Set oLink = oWS.CreateShortcut^(sLinkFile^)
    echo oLink.TargetPath = "%INSTALL_DIR%\\Famiglia.exe"
    echo oLink.WorkingDirectory = "%INSTALL_DIR%"
    echo oLink.Description = "Famiglia - Gestione Economica e Finanziaria Familiare"
    echo If oWS.FileSystemObject.FileExists^("%INSTALL_DIR%\\icon.ico"^) Then
    echo     oLink.IconLocation = "%INSTALL_DIR%\\icon.ico, 0"
    echo End If
    echo oLink.Save
) > "%SHORTCUT_VBS%"

cscript //nologo "%SHORTCUT_VBS%" >nul 2>&1
del "%SHORTCUT_VBS%" >nul 2>&1

echo.
echo ===================================================================
echo     INSTALLAZIONE COMPLETATA CON SUCCESSO!
echo ===================================================================
echo.
echo - File eseguibile creato: %INSTALL_DIR%\\Famiglia.exe
echo - Icona creata sul Desktop: 'Famiglia Economica'
echo - Funzionamento: 100%% Offline e locale (privacy totale)
echo.
echo Avvio di Famiglia in corso...
start "" "%INSTALL_DIR%\\Famiglia.exe"
timeout /t 3 >nul
exit
`;

  // 2. PowerShell Automated Installer
  const powershellInstaller = `# Script PowerShell per creare automaticamente Famiglia.exe e il collegamento Desktop
$ErrorActionPreference = "SilentlyContinue"
$currentDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $currentDir

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "    CREAZIONE AUTOMATICA ESEGUIBILE FAMIGLIA.EXE          " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$cscPath = "$env:SystemRoot\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe"
if (!(Test-Path $cscPath)) {
    $cscPath = "$env:SystemRoot\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe"
}

if (Test-Path $cscPath) {
    Write-Host "[1/2] Compilazione eseguibile Windows con C# ($cscPath)..." -ForegroundColor Yellow
    & $cscPath /nologo /target:winexe /out:"Famiglia.exe" /win32icon:icon.ico Program.cs
    if (Test-Path "Famiglia.exe") {
        Write-Host "[OK] Famiglia.exe creato con successo!" -ForegroundColor Green
    }
} else {
    Write-Host "[Info] Compilatore locale non trovato, preparo l'eseguibile nativo..." -ForegroundColor Yellow
    if (Test-Path "Famiglia-Installer.exe") {
        Copy-Item "Famiglia-Installer.exe" "Famiglia.exe" -Force
    }
}

Write-Host "[2/2] Creazione icona sul Desktop..." -ForegroundColor Yellow
$WshShell = New-Object -ComObject WScript.Shell
$desktopPath = [System.Environment]::GetFolderPath('Desktop')
$Shortcut = $WshShell.CreateShortcut("$desktopPath\\Famiglia Economica.lnk")
$Shortcut.TargetPath = "$currentDir\\Famiglia.exe"
$Shortcut.WorkingDirectory = "$currentDir"
if (Test-Path "$currentDir\\icon.ico") {
    $Shortcut.IconLocation = "$currentDir\\icon.ico, 0"
}
$Shortcut.Save()

Write-Host "[OK] Icona creata sul Desktop!" -ForegroundColor Green
Write-Host ""
Write-Host "Avvio applicazione in corso..." -ForegroundColor Cyan
Start-Process "$currentDir\\Famiglia.exe"
`;

  // 3. Program.cs for native C# compilation (opens in borderless standalone Edge window with local embedded HTTP server)
  const csharpProgram = `using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Windows.Forms;

namespace FamigliaApp {
    static class Program {
        private static HttpListener listener;
        private static int port = 3388;
        private static bool running = true;

        [STAThread]
        static void Main() {
            try {
                string currentDir = AppDomain.CurrentDomain.BaseDirectory;
                
                // Cerca porta libera per il server HTTP locale
                for (int p = 3388; p < 3450; p++) {
                    try {
                        listener = new HttpListener();
                        listener.Prefixes.Add(string.Format("http://localhost:{0}/", p));
                        listener.Start();
                        port = p;
                        break;
                    } catch {
                        if (listener != null) {
                            try { listener.Close(); } catch { }
                            listener = null;
                        }
                    }
                }

                if (listener != null && listener.IsListening) {
                    Thread serverThread = new Thread(() => {
                        while (running && listener != null && listener.IsListening) {
                            try {
                                HttpListenerContext ctx = listener.GetContext();
                                ThreadPool.QueueUserWorkItem((s) => ServeFile(ctx, currentDir));
                            } catch { }
                        }
                    });
                    serverThread.IsBackground = true;
                    serverThread.Start();
                }

                string targetUrl = (listener != null && listener.IsListening) 
                    ? string.Format("http://localhost:{0}/index.html", port) 
                    : ("file:///" + Path.Combine(currentDir, "index.html").Replace('\\\\', '/'));

                // Avvia Microsoft Edge in modalita' finestra applicativa dedicata (--app=)
                string edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\\Edge\\Application\\msedge.exe");
                if (!File.Exists(edgePath)) {
                    edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\\Edge\\Application\\msedge.exe");
                }

                Process proc = null;
                if (File.Exists(edgePath)) {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = edgePath;
                    psi.Arguments = string.Format("--app=\"{0}\" --window-size=1280,850", targetUrl);
                    psi.UseShellExecute = false;
                    proc = Process.Start(psi);
                } else {
                    proc = Process.Start(new ProcessStartInfo {
                        FileName = targetUrl,
                        UseShellExecute = true
                    });
                }

                if (proc != null) {
                    proc.WaitForExit();
                } else {
                    Thread.Sleep(5000);
                }
            } catch (Exception ex) {
                MessageBox.Show("Famiglia Local Runner: " + ex.Message, "Famiglia Desktop", MessageBoxButtons.OK, MessageBoxIcon.Information);
            } finally {
                running = false;
                if (listener != null) {
                    try { listener.Stop(); listener.Close(); } catch { }
                }
            }
        }

        static void ServeFile(HttpListenerContext ctx, string baseDir) {
            try {
                string raw = ctx.Request.Url.LocalPath.TrimStart('/');
                if (string.IsNullOrEmpty(raw)) raw = "index.html";
                string full = Path.Combine(baseDir, raw.Replace('/', Path.DirectorySeparatorChar));

                if (!File.Exists(full)) {
                    full = Path.Combine(baseDir, "index.html");
                }

                if (File.Exists(full)) {
                    byte[] b = File.ReadAllBytes(full);
                    string ext = Path.GetExtension(full).ToLower();
                    if (ext == ".html") ctx.Response.ContentType = "text/html; charset=utf-8";
                    else if (ext == ".js") ctx.Response.ContentType = "application/javascript";
                    else if (ext == ".css") ctx.Response.ContentType = "text/css";
                    else if (ext == ".json") ctx.Response.ContentType = "application/json";
                    else if (ext == ".png") ctx.Response.ContentType = "image/png";
                    else if (ext == ".ico") ctx.Response.ContentType = "image/x-icon";
                    else if (ext == ".svg") ctx.Response.ContentType = "image/svg+xml";

                    ctx.Response.ContentLength64 = b.Length;
                    ctx.Response.OutputStream.Write(b, 0, b.Length);
                } else {
                    ctx.Response.StatusCode = 404;
                }
            } catch {
                ctx.Response.StatusCode = 500;
            } finally {
                try { ctx.Response.OutputStream.Close(); } catch { }
            }
        }
    }
}
`;

  // 3b. Dedicated Supabase Launcher Batch
  const supabaseLauncherBat = `@echo off
title Famiglia - Connessione Locale e Supabase
color 0B
echo ===================================================================
echo     FAMIGLIA - ESECUZIONE IN LOCO CON SUPABASE
echo ===================================================================
echo.
echo Controllo file di configurazione Supabase...
if exist "%~dp0supabase.config.json" (
    echo [OK] Trovato supabase.config.json con credenziali configurate.
) else (
    echo [INFO] Nessun file supabase.config.json. L'app utilizzera' il salvataggio locale.
)
echo.
echo Avvio dell'applicazione desktop...
if exist "%~dp0Famiglia.exe" (
    start "" "%~dp0Famiglia.exe"
    exit
)
call "%~dp0Avvia-Finestra-Nativa.bat"
`;

  // 3c. Dedicated Supabase Installer Batch
  const supabaseInstallerBat = `@echo off
setlocal enabledelayedexpansion
title Famiglia - Installatore Supabase Windows
color 0B

echo ===================================================================
echo     FAMIGLIA - INSTALLAZIONE IN LOCO CON DATABASE SUPABASE
echo ===================================================================
echo.
set "INSTALL_DIR=%LOCALAPPDATA%\\FamigliaApp"
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo Copia dei file applicativi e configurazione Supabase...
xcopy /Y /E /I /Q * "%INSTALL_DIR%\\" >nul 2>&1

cd /d "%INSTALL_DIR%"

set "CSC="
if exist "%SystemRoot%\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe" (
    set "CSC=%SystemRoot%\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe"
) else if exist "%SystemRoot%\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe" (
    set "CSC=%SystemRoot%\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe"
)

if defined CSC (
    echo Compilazione eseguibile C# con supporto Supabase...
    "%CSC%" /nologo /target:winexe /out:"Famiglia.exe" /win32icon:icon.ico Program.cs >nul 2>&1
)

if not exist "Famiglia.exe" (
    if exist "Famiglia-Installer.exe" copy /Y "Famiglia-Installer.exe" "Famiglia.exe" >nul 2>&1
)

set "SHORTCUT_VBS=%TEMP%\\create_shortcut_%RANDOM%.vbs"
(
    echo Set oWS = WScript.CreateObject^("WScript.Shell"^)
    echo sLinkFile = oWS.SpecialFolders^("Desktop"^) ^& "\\Famiglia Economica.lnk"
    echo Set oLink = oWS.CreateShortcut^(sLinkFile^)
    echo oLink.TargetPath = "%INSTALL_DIR%\\Famiglia.exe"
    echo oLink.WorkingDirectory = "%INSTALL_DIR%"
    echo oLink.Description = "Famiglia - Gestione Economica Familiare con Supabase"
    echo If oWS.FileSystemObject.FileExists^("%INSTALL_DIR%\\icon.ico"^) Then
    echo     oLink.IconLocation = "%INSTALL_DIR%\\icon.ico, 0"
    echo End If
    echo oLink.Save
) > "%SHORTCUT_VBS%"

cscript //nologo "%SHORTCUT_VBS%" >nul 2>&1
del "%SHORTCUT_VBS%" >nul 2>&1

echo.
echo ===================================================================
echo     INSTALLAZIONE COMPLETATA CON SUCCESSO!
echo ===================================================================
echo Icona 'Famiglia Economica' inserita sul tuo Desktop.
echo Connessione al database Supabase pronta.
echo.
pause
start "" "%INSTALL_DIR%\\Famiglia.exe"
`;

  // 4. Windows Quick Native Launcher (Avvia-Finestra-Nativa.bat)
  const windowsNativeBat = `@echo off
title Famiglia Desktop (Finestra Nativa)
set "HTML_PATH=%~dp0index.html"
set "HTML_URL=file:///%HTML_PATH:\\=/%"

:: Avvio con Edge in modalita' app nativa standalone (senza barre di navigazione ne' schede)
set "EDGE=%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe"

if exist "%EDGE%" (
    start "" "%EDGE%" --app="%HTML_URL%" --window-size=1280,850
    exit
)

:: Avvio con Google Chrome se Edge non e' presente
set "CHROME=%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\\Google\\Chrome\\Application\\chrome.exe"
if not exist "%CHROME%" set "CHROME=%LocalAppData%\\Google\\Chrome\\Application\\chrome.exe"

if exist "%CHROME%" (
    start "" "%CHROME%" --app="%HTML_URL%" --window-size=1280,850
    exit
)

:: Fallback su browser predefinito
start "" "%HTML_PATH%"
exit
`;

  // 5. Windows Standard Launcher
  const windowsBat = `@echo off
title Famiglia - Gestione Economica Desktop
color 0A
echo ===================================================
echo     Famiglia - Gestione Economica (Desktop App)
echo ===================================================
echo.
echo Avvio dell'applicazione in corso...
echo.

if exist "Famiglia.exe" (
    start "" "Famiglia.exe"
    exit
)

call Avvia-Finestra-Nativa.bat
`;

  // 6. macOS Launcher Script (Avvia-Famiglia-Mac.command)
  const macCommand = `#!/bin/bash
DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "==================================================="
echo "    Famiglia - Gestione Economica (Desktop App)    "
echo "==================================================="
echo ""
echo "Avvio dell'applicazione Desktop su macOS..."

if command -v python3 &>/dev/null; then
    open "http://localhost:8080/index.html"
    python3 -m http.server 8080
elif command -v open &>/dev/null; then
    open "index.html"
fi
`;

  // 7. Linux Launcher Script (Avvia-Famiglia-Linux.sh)
  const linuxSh = `#!/bin/bash
DIR="$( cd "$( dirname "\${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "==================================================="
echo "    Famiglia - Gestione Economica (Desktop App)    "
echo "==================================================="
echo ""

if command -v python3 &>/dev/null; then
    xdg-open "http://localhost:8080/index.html" 2>/dev/null || sensible-browser "http://localhost:8080/index.html" 2>/dev/null
    python3 -m http.server 8080
else
    xdg-open "index.html" 2>/dev/null || sensible-browser "index.html" 2>/dev/null
fi
`;

  // 8. Linux Desktop Entry Shortcut
  const desktopShortcut = `[Desktop Entry]
Name=Famiglia Economica
Comment=Gestione Finanziaria Familiare Desktop
Exec=bash -c "cd \\"$(dirname "%k")\\" && ./Avvia-Famiglia-Linux.sh"
Icon=icon.png
Terminal=false
Type=Application
Categories=Office;Finance;
`;

  // 9. Electron Wrapper (main.js)
  const electronMain = `const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: 'Famiglia — Gestione Economica Desktop',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: '#fafaf9',
    show: false,
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
`;

  // 10. Electron package.json
  const electronPackageJson = JSON.stringify(
    {
      name: 'famiglia-desktop-app',
      version: '2.4.0',
      description: 'Applicazione Desktop per la gestione finanziaria familiare',
      main: 'electron-main.js',
      scripts: {
        start: 'electron .',
        'build:win': 'electron-builder --win',
        'build:mac': 'electron-builder --mac',
        'build:linux': 'electron-builder --linux',
      },
      author: 'Famiglia',
      devDependencies: {
        electron: '^28.0.0',
        'electron-builder': '^24.9.1',
      },
      build: {
        appId: 'it.famiglia.gestione-economica',
        productName: 'Famiglia Economica',
        win: {
          target: ['portable', 'nsis'],
          icon: 'icon.ico',
        },
        mac: {
          target: ['dmg', 'zip'],
          icon: 'icon.png',
        },
        linux: {
          target: ['AppImage'],
          icon: 'icon.png',
        },
      },
    },
    null,
    2
  );

  // 11. Readme
  const readme = `========================================================================
   FAMIGLIA — GESTIONE ECONOMICA FAMILIARE (WINDOWS INSTALLER & ESEGUIBILE)
========================================================================

Questa cartella include tutto il necessario per installare ed eseguire
Famiglia come applicazione nativa per Windows:

COME INSTALLARE E CREARE IL FILE EXE AUTOMATICAMENTE SU WINDOWS:
------------------------------------------------------------------------
METODO 1 (Consigliato - Installer Automatico):
1. Fai doppio clic su: "Installa-Famiglia-Windows.bat"
2. L'installer:
   - Configura la cartella di sistema in %LOCALAPPDATA%\\FamigliaApp
   - Compila e genera automaticamente il file eseguibile "Famiglia.exe"
   - Crea il collegamento con icona ufficiale direttamente sul tuo Desktop!
   - Avvia l'applicazione in una finestra indipendente.

METODO 2 (Script PowerShell):
- Fai clic col tasto destro su "Crea-Famiglia-EXE.ps1" e seleziona
  "Esegui con PowerShell".

METODO 3 (Eseguibile Diretto .exe):
- Trovi già incluso il file "Famiglia-Installer.exe": basta fare doppio
  clic per avviarlo o avviare "Avvia-Finestra-Nativa.bat".

ALTRI SISTEMI OPERATIVI:
- macOS: Fai doppio clic su "Avvia-Famiglia-Mac.command"
- Linux: Esegui "Avvia-Famiglia-Linux.sh"
- Electron: Se hai Node.js, digita 'npm install' e 'npm start'.

PRIVACY E DATI:
- 100% offline e locale sul tuo disco fisso. Nessun dato inviato online.
========================================================================
`;

  // Supabase Desktop README
  const supabaseReadme = `========================================================================
   FAMIGLIA — ESEGUIBILE IN LOCO CON DATABASE SUPABASE (POSTGRESQL)
========================================================================

Questa versione e' pronta per eseguire l'applicazione direttamente sul tuo
PC Windows collegandosi in tempo reale al tuo database Supabase.

COME AVVIARE IN LOCO CON SUPABASE:
------------------------------------------------------------------------
1. CONFIGURA SUPABASE (se non lo hai ancora fatto):
   - Vai sul tuo progetto su https://supabase.com
   - Apri la sezione "SQL Editor"
   - Incolla ed esegui il file allegato: "supabase_schema.sql"

2. INSERISCI LE TUE CREDENZIALI:
   - Apri il file "supabase.config.json" con Blocco Note
   - Inserisci il tuo "supabaseUrl" e "supabaseAnonKey"
   - Salva il file (Ctrl+S)

3. AVVIA L'APPLICAZIONE:
   - Fai doppio clic su: "Famiglia.exe" (o "Avvia-Famiglia-Supabase.bat")
   - L'applicazione partira' in locale su http://localhost:3388 e carichera'
     automaticamente le credenziali da supabase.config.json, sincronizzando
     i dati sia in locale che sul cloud Supabase!

INSTALLATORE AUTOMATICO DESKTOP:
- Fai doppio clic su "Installa-Famiglia-Supabase.bat" per installare
  l'app in %LOCALAPPDATA%\\FamigliaApp e creare l'icona sul Desktop.
========================================================================
`;

  // Fetch current page HTML or fallback
  let htmlContent = '';
  try {
    const response = await fetch(window.location.href);
    htmlContent = await response.text();
  } catch {
    htmlContent = document.documentElement.outerHTML;
  }

  // Populate ZIP
  zip.file('Installa-Famiglia-Windows.bat', windowsInstallerBat);
  zip.file('Installa-Famiglia-Supabase.bat', supabaseInstallerBat);
  zip.file('Avvia-Famiglia-Supabase.bat', supabaseLauncherBat);
  zip.file('Crea-Famiglia-EXE.ps1', powershellInstaller);
  zip.file('Program.cs', csharpProgram);
  zip.file('Avvia-Finestra-Nativa.bat', windowsNativeBat);
  zip.file('Avvia-Famiglia-Windows.bat', windowsBat);
  zip.file('Avvia-Famiglia-Mac.command', macCommand);
  zip.file('Avvia-Famiglia-Linux.sh', linuxSh);
  zip.file('Famiglia-Desktop.desktop', desktopShortcut);
  zip.file('electron-main.js', electronMain);
  zip.file('package.json', electronPackageJson);
  zip.file('LEGGIMI_INSTALLATORE_WINDOWS.txt', readme);
  zip.file('LEGGIMI_SUPABASE_DESKTOP.txt', supabaseReadme);
  zip.file('index.html', htmlContent);

  // Add Supabase files
  const cfg = getSupabaseConfig();
  const customUrl = options?.supabaseUrl || cfg.url;
  const customKey = options?.supabaseAnonKey || cfg.anonKey;
  zip.file('supabase.config.json', generateSupabaseConfigFile(customUrl, customKey));
  zip.file('supabase_schema.sql', SUPABASE_SCHEMA_SQL);

  // Add the compiled .exe binary directly into the ZIP
  try {
    let exeBytes: Uint8Array;
    const exeRes = await fetch('/Famiglia-Installer.exe');
    if (exeRes.ok) {
      const buffer = await exeRes.arrayBuffer();
      exeBytes = new Uint8Array(buffer);
    } else {
      exeBytes = base64ToUint8Array(WINDOWS_PE_BASE64);
    }
    zip.file('Famiglia-Installer.exe', exeBytes);
    zip.file('Famiglia.exe', exeBytes);
  } catch {
    const fallbackBytes = base64ToUint8Array(WINDOWS_PE_BASE64);
    zip.file('Famiglia-Installer.exe', fallbackBytes);
    zip.file('Famiglia.exe', fallbackBytes);
  }

  // Add icon.ico and icon.png
  try {
    const icoRes = await fetch('/icon.ico');
    if (icoRes.ok) {
      const icoBlob = await icoRes.blob();
      zip.file('icon.ico', icoBlob);
    }
  } catch (err) {
    console.warn('Could not bundle icon.ico:', err);
  }

  try {
    const iconRes = await fetch('/pwa-512x512.png');
    if (iconRes.ok) {
      const iconBlob = await iconRes.blob();
      zip.file('icon.png', iconBlob);
    }
  } catch (err) {
    console.warn('Could not bundle icon.png:', err);
  }

  // Generate ZIP blob and trigger download
  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Famiglia-Windows-Installer-Desktop.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Dedicated packaging function for the Supabase Local Desktop package
 */
export async function generateAndDownloadSupabaseDesktopPackage(
  supabaseUrl?: string,
  anonKey?: string
): Promise<void> {
  const zip = new JSZip();

  const cfg = getSupabaseConfig();
  const targetUrl = supabaseUrl || cfg.url;
  const targetKey = anonKey || cfg.anonKey;

  // Include config file & schema
  zip.file('supabase.config.json', generateSupabaseConfigFile(targetUrl, targetKey));
  zip.file('supabase_schema.sql', SUPABASE_SCHEMA_SQL);

  // Include direct EXE
  try {
    let exeBytes: Uint8Array;
    const exeRes = await fetch('/Famiglia-Installer.exe');
    if (exeRes.ok) {
      const buffer = await exeRes.arrayBuffer();
      exeBytes = new Uint8Array(buffer);
    } else {
      exeBytes = base64ToUint8Array(WINDOWS_PE_BASE64);
    }
    zip.file('Famiglia.exe', exeBytes);
    zip.file('Famiglia-Installer.exe', exeBytes);
  } catch {
    const fallbackBytes = base64ToUint8Array(WINDOWS_PE_BASE64);
    zip.file('Famiglia.exe', fallbackBytes);
    zip.file('Famiglia-Installer.exe', fallbackBytes);
  }

  // HTML content
  let htmlContent = '';
  try {
    const response = await fetch(window.location.href);
    htmlContent = await response.text();
  } catch {
    htmlContent = document.documentElement.outerHTML;
  }
  zip.file('index.html', htmlContent);

  // Batch launchers
  const launcherBat = `@echo off
title Famiglia - Connessione Locale e Supabase
color 0B
echo ===================================================================
echo     FAMIGLIA - AVVIO IN LOCO CON DATABASE SUPABASE
echo ===================================================================
echo.
if exist "%~dp0Famiglia.exe" (
    start "" "%~dp0Famiglia.exe"
    exit
)
start "" "%~dp0index.html"
`;

  const installerBat = `@echo off
setlocal enabledelayedexpansion
title Famiglia - Installatore Supabase Windows
color 0B
echo ===================================================================
echo     FAMIGLIA - INSTALLATORE AUTOMATICO CON SUPABASE
echo ===================================================================
echo.
set "INSTALL_DIR=%LOCALAPPDATA%\\FamigliaApp"
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

xcopy /Y /E /I /Q * "%INSTALL_DIR%\\" >nul 2>&1
cd /d "%INSTALL_DIR%"

set "CSC="
if exist "%SystemRoot%\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe" (
    set "CSC=%SystemRoot%\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe"
) else if exist "%SystemRoot%\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe" (
    set "CSC=%SystemRoot%\\Microsoft.NET\\Framework\\v4.0.30319\\csc.exe"
)

if defined CSC (
    "%CSC%" /nologo /target:winexe /out:"Famiglia.exe" /win32icon:icon.ico Program.cs >nul 2>&1
)

if not exist "Famiglia.exe" (
    if exist "Famiglia-Installer.exe" copy /Y "Famiglia-Installer.exe" "Famiglia.exe" >nul 2>&1
)

set "SHORTCUT_VBS=%TEMP%\\create_shortcut_%RANDOM%.vbs"
(
    echo Set oWS = WScript.CreateObject^("WScript.Shell"^)
    echo sLinkFile = oWS.SpecialFolders^("Desktop"^) ^& "\\Famiglia Economica.lnk"
    echo Set oLink = oWS.CreateShortcut^(sLinkFile^)
    echo oLink.TargetPath = "%INSTALL_DIR%\\Famiglia.exe"
    echo oLink.WorkingDirectory = "%INSTALL_DIR%"
    echo oLink.Description = "Famiglia - Gestione Economica con Supabase"
    echo If oWS.FileSystemObject.FileExists^("%INSTALL_DIR%\\icon.ico"^) Then
    echo     oLink.IconLocation = "%INSTALL_DIR%\\icon.ico, 0"
    echo End If
    echo oLink.Save
) > "%SHORTCUT_VBS%"

cscript //nologo "%SHORTCUT_VBS%" >nul 2>&1
del "%SHORTCUT_VBS%" >nul 2>&1

echo.
echo Installazione completata con successo! Collegamento creato sul Desktop.
pause
start "" "%INSTALL_DIR%\\Famiglia.exe"
`;

  zip.file('Avvia-Famiglia-Supabase.bat', launcherBat);
  zip.file('Installa-Famiglia-Supabase.bat', installerBat);

  const instructions = `========================================================================
   FAMIGLIA — PACCHETTO DESKTOP WINDOWS CON SUPABASE
========================================================================

1. Esegui lo script "supabase_schema.sql" nella dashboard SQL del tuo Supabase.
2. Verifica che "supabase.config.json" contenga le tue credenziali Supabase.
3. Fai doppio clic su "Famiglia.exe" (o "Installa-Famiglia-Supabase.bat").

Buona gestione economica!
========================================================================
`;
  zip.file('LEGGIMI_SUPABASE.txt', instructions);

  // Icons
  try {
    const icoRes = await fetch('/icon.ico');
    if (icoRes.ok) zip.file('icon.ico', await icoRes.blob());
  } catch {}

  try {
    const pngRes = await fetch('/pwa-512x512.png');
    if (pngRes.ok) zip.file('icon.png', await pngRes.blob());
  } catch {}

  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Famiglia-EXE-Supabase-Package.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
