import React, { useState } from 'react';
import {
  Download,
  X,
  Laptop,
  CheckCircle2,
  Terminal,
  FolderArchive,
  Monitor,
  ShieldCheck,
  FileCode,
  Sparkles,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import {
  generateAndDownloadDesktopPackage,
  downloadDirectWindowsExe,
} from '../utils/executablePackager';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface DownloadExecutableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadExecutableModal: React.FC<DownloadExecutableModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activePlatform, setActivePlatform] = useState<'windows' | 'mac' | 'linux' | 'electron'>('windows');
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [isDownloadingExe, setIsDownloadingExe] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const { isInstallable, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleDownloadExe = async () => {
    try {
      setIsDownloadingExe(true);
      await downloadDirectWindowsExe('Famiglia-Installer.exe');
    } catch (err) {
      alert('Errore durante il download del file .exe: ' + err);
    } finally {
      setIsDownloadingExe(false);
    }
  };

  const handleDownloadZip = async () => {
    try {
      setIsGeneratingZip(true);
      await generateAndDownloadDesktopPackage();
    } catch (err) {
      alert('Errore nella generazione del pacchetto: ' + err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div
      id="download-executable-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="bg-stone-900 dark:bg-black text-white p-5 flex items-center justify-between border-b border-stone-800 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Scarica l'App per Windows (File EXE & Installer)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                  Windows 10 / 11 Ready
                </span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Esegui Famiglia in locale sul tuo computer con database offline e finestra dedicata
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Windows Quick Action Banner: Both Direct EXE and Automated Installer */}
        <div className="p-6 bg-gradient-to-br from-emerald-50 via-teal-50/40 to-stone-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 border-b border-stone-200 dark:border-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Option 1: Direct .EXE Download */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-emerald-500/80 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-emerald-600 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    <Zap className="w-4 h-4" />
                    <span>File .EXE Diretto</span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded">
                    Download Rapido
                  </span>
                </div>
                <h4 className="text-xs font-bold text-stone-900 dark:text-zinc-100">
                  Famiglia-Installer.exe
                </h4>
                <p className="text-[11px] text-stone-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  Scarica direttamente il file eseguibile <code className="bg-stone-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-stone-800 dark:text-zinc-200 font-mono text-[10px]">.exe</code> nativo per Windows senza dover estrarre alcun archivio.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800">
                <button
                  onClick={handleDownloadExe}
                  disabled={isDownloadingExe}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isDownloadingExe ? 'Download in corso...' : 'Scarica File .EXE Diretto'}</span>
                </button>
              </div>
            </div>

            {/* Option 2: Automated Windows Installer (.ZIP with .bat & .ps1 that creates .exe & Desktop icon) */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-indigo-500/80 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:border-indigo-600 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Windows Installer Automatico</span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded">
                    Consigliato
                  </span>
                </div>
                <h4 className="text-xs font-bold text-stone-900 dark:text-zinc-100">
                  Installer con Creazione EXE + Icona Desktop
                </h4>
                <p className="text-[11px] text-stone-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  Include lo script <code className="bg-stone-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-stone-800 dark:text-zinc-200 font-mono text-[10px]">Installa-Famiglia-Windows.bat</code> che compila automaticamente <strong className="text-stone-900 dark:text-zinc-200">Famiglia.exe</strong> e crea il collegamento sul Desktop.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800">
                <button
                  onClick={handleDownloadZip}
                  disabled={isGeneratingZip}
                  className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>{isGeneratingZip ? 'Generazione pacchetto...' : 'Scarica Pacchetto Installer (.zip)'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Direct PWA Install Option if browser supports it */}
          {isInstallable && (
            <div className="mt-4 pt-3 border-t border-stone-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs text-stone-700 dark:text-zinc-300">
                Oppure installa l'app direttamente in 1 clic sul tuo sistema operativo tramite PWA:
              </span>
              <button
                onClick={async () => {
                  await install();
                  onClose();
                }}
                className="px-3 py-1.5 bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-zinc-700 rounded-lg text-xs font-semibold cursor-pointer shrink-0"
              >
                Installa Subito sul PC
              </button>
            </div>
          )}
        </div>

        {/* Instructions & Platform Details */}
        <div className="p-6">
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-zinc-800 rounded-xl mb-4 text-xs font-semibold">
            <button
              onClick={() => setActivePlatform('windows')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePlatform === 'windows'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-xs'
                  : 'text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-indigo-500" />
              <span>Windows (Guida Installer & EXE)</span>
            </button>
            <button
              onClick={() => setActivePlatform('mac')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePlatform === 'mac'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-xs'
                  : 'text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>macOS</span>
            </button>
            <button
              onClick={() => setActivePlatform('linux')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePlatform === 'linux'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-xs'
                  : 'text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Linux</span>
            </button>
            <button
              onClick={() => setActivePlatform('electron')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePlatform === 'electron'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-xs'
                  : 'text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Electron Setup</span>
            </button>
          </div>

          {/* Platform Detail Content */}
          <div className="space-y-3 text-xs text-stone-600 dark:text-zinc-400">
            {activePlatform === 'windows' && (
              <div className="bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-stone-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Come funziona l'Installer Automatico per Windows:</span>
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 leading-relaxed pl-1">
                    <li>
                      Scarica il pacchetto ed estrailo in una cartella a tua scelta (es. in Download o Documenti).
                    </li>
                    <li>
                      Fai doppio clic sul file <strong className="text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 font-mono">Installa-Famiglia-Windows.bat</strong> (oppure clic destro su <span className="font-mono text-[11px]">Crea-Famiglia-EXE.ps1</span> &rarr; "Esegui con PowerShell").
                    </li>
                    <li>
                      L'installer utilizza il compilatore integrato di Windows per creare automaticamente l'eseguibile nativo <strong className="text-emerald-700 dark:text-emerald-400 font-bold">Famiglia.exe</strong> con l'icona ufficiale.
                    </li>
                    <li>
                      Viene creato all'istante il collegamento <strong className="text-stone-900 dark:text-zinc-200">"Famiglia Economica"</strong> sul tuo <strong>Desktop di Windows</strong> per aprirla con un clic.
                    </li>
                    <li>
                      L'app si avvia in una finestra desktop dedicata (senza barre del browser né schede), garantendo il massimo spazio di lavoro.
                    </li>
                  </ol>
                </div>

                <div className="border-t border-stone-200 dark:border-zinc-800 pt-3">
                  <h5 className="font-bold text-stone-900 dark:text-zinc-200 text-xs mb-1">
                    Vuoi solo il file .exe senza estrarre nulla?
                  </h5>
                  <p className="text-[11px] leading-relaxed">
                    Premi il pulsante verde in alto <strong>"Scarica File .EXE Diretto"</strong> per scaricare direttamente <code className="font-mono bg-stone-200 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 px-1 py-0.5 rounded">Famiglia-Installer.exe</code>.
                  </p>
                </div>
              </div>
            )}

            {activePlatform === 'mac' && (
              <div className="bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-stone-900 dark:text-zinc-100 text-sm">Avvio su macOS (Apple Silicon M1/M2/M3 & Intel):</h4>
                <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                  <li>
                    Scarica ed estrai la cartella sul tuo Mac.
                  </li>
                  <li>
                    Fai doppio clic su <strong className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">Avvia-Famiglia-Mac.command</strong>.
                  </li>
                  <li>
                    Se macOS mostra un avviso di sicurezza la prima volta: fai clic destro sul file &rarr; <em>Apri</em> &rarr; <em>Conferma</em>.
                  </li>
                  <li>
                    L'app funzionerà offline memorizzando tutti i dati in locale.
                  </li>
                </ol>
              </div>
            )}

            {activePlatform === 'linux' && (
              <div className="bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-stone-900 dark:text-zinc-100 text-sm">Avvio su Linux (Ubuntu, Debian, Fedora, Arch):</h4>
                <p>Apri il terminale nella cartella estratta ed esegui:</p>
                <div className="bg-stone-900 text-emerald-400 font-mono p-3 rounded-lg flex items-center justify-between">
                  <code>chmod +x Avvia-Famiglia-Linux.sh && ./Avvia-Famiglia-Linux.sh</code>
                  <button
                    onClick={() => copyToClipboard('chmod +x Avvia-Famiglia-Linux.sh && ./Avvia-Famiglia-Linux.sh')}
                    className="text-stone-400 hover:text-white transition-colors"
                  >
                    {copiedScript ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-stone-500">
                  È incluso anche il file <code className="text-stone-800 dark:text-zinc-200 font-mono">Famiglia-Desktop.desktop</code> per integrarla nel launcher del sistema.
                </p>
              </div>
            )}

            {activePlatform === 'electron' && (
              <div className="bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-stone-900 dark:text-zinc-100 text-sm">Compilazione avanzata con Electron:</h4>
                <p>
                  Nel pacchetto zip sono inclusi <strong className="text-stone-800 dark:text-zinc-200">electron-main.js</strong> e <strong className="text-stone-800 dark:text-zinc-200">package.json</strong> con electron-builder configurato:
                </p>
                <div className="bg-stone-900 text-stone-200 font-mono p-3 rounded-lg space-y-1 text-[11px]">
                  <p className="text-stone-400"># 1. Installa dipendenze:</p>
                  <p className="text-emerald-400">npm install</p>
                  <p className="text-stone-400 pt-1"># 2. Avvia finestra nativa:</p>
                  <p className="text-emerald-400">npm start</p>
                  <p className="text-stone-400 pt-1"># 3. Compila installer setup .exe per Windows:</p>
                  <p className="text-emerald-400">npm run build:win</p>
                </div>
              </div>
            )}
          </div>

          {/* Privacy and Storage Assurance */}
          <div className="mt-5 p-3.5 bg-stone-100 dark:bg-zinc-800/80 rounded-xl flex items-start gap-3 border border-stone-200 dark:border-zinc-700">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-stone-600 dark:text-zinc-300 leading-normal">
              <strong className="text-stone-900 dark:text-zinc-100 block font-semibold">100% Locale, Riservato e Indipendente</strong>
              I dati finanziari della tua famiglia rimangono memorizzati esclusivamente sul disco rigido del tuo computer.
              Puoi esportare copie di backup in qualsiasi momento dal menu <em>File &rarr; Esporta Backup (.json)</em>.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-stone-50 dark:bg-zinc-950 p-4 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadExe}
              disabled={isDownloadingExe}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Scarica .EXE</span>
            </button>
            <button
              onClick={handleDownloadZip}
              disabled={isGeneratingZip}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Scarica Installer (.zip)</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-300 border border-stone-300 dark:border-zinc-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
