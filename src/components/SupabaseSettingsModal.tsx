import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Download,
  ExternalLink,
  Laptop,
  FileCode,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import {
  getSupabaseConfig,
  setSupabaseConfig,
  testSupabaseConnection,
  generateSupabaseConfigFile,
  SUPABASE_SCHEMA_SQL,
} from '../lib/supabase';
import { downloadDirectWindowsExe } from '../utils/executablePackager';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDownloadModal?: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenDownloadModal,
}) => {
  const {
    isSupabaseConfigured,
    isSupabaseConnected,
    supabaseLastSyncedAt,
    syncWithSupabaseNow,
    pullFromSupabaseNow,
  } = useFamily();

  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sql' | 'exe'>('config');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url || '');
      setAnonKey(cfg.anonKey || '');
      setTestResult(null);
      setSyncFeedback(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(url, anonKey);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Errore durante il test' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const res = setSupabaseConfig(url, anonKey);
    if (res.success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      handleTestConnection();
    } else {
      alert(res.error || 'Errore durante il salvataggio');
    }
  };

  const handleManualSyncPush = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncWithSupabaseNow();
      setSyncFeedback(res.message);
    } catch (err: any) {
      setSyncFeedback('Errore: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleManualSyncPull = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await pullFromSupabaseNow();
      setSyncFeedback(res.message);
    } catch (err: any) {
      setSyncFeedback('Errore: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const downloadConfigFile = () => {
    const jsonStr = generateSupabaseConfigFile(url, anonKey);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'supabase.config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  };

  const downloadSqlFile = () => {
    const blob = new Blob([SUPABASE_SCHEMA_SQL], { type: 'text/plain' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'supabase_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div
      id="supabase-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="bg-emerald-950 dark:bg-black text-white p-5 flex items-center justify-between border-b border-emerald-900 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Database Supabase Cloud & Locale</h3>
                {isSupabaseConnected ? (
                  <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Connesso
                  </span>
                ) : isSupabaseConfigured ? (
                  <span className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                    Non raggiungibile
                  </span>
                ) : (
                  <span className="text-[10px] bg-stone-700/60 text-stone-300 font-semibold px-2 py-0.5 rounded-full">
                    Modalità Locale
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-300/80 dark:text-zinc-400 mt-0.5">
                Collega l'applicazione al tuo database Postgres su Supabase in locale o nel cloud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-600 dark:border-emerald-400'
                : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Configurazione Connessione</span>
          </button>

          <button
            onClick={() => setActiveTab('exe')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'exe'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-600 dark:border-emerald-400'
                : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Esecuzione in Loco (EXE)</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 border-t-2 border-emerald-600 dark:border-emerald-400'
                : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Schema SQL Supabase</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 space-y-4">
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Sincronizzazione Ibrida Offline-First</span>
                </div>
                <p className="text-emerald-800 dark:text-emerald-300">
                  I dati vengono sempre salvati istantaneamente sul tuo computer e sincronizzati sul database Supabase non appena c'è connessione.
                </p>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-zinc-300 mb-1">
                  Supabase Project URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-1">
                  Lo trovi nella dashboard di Supabase sotto: <em>Project Settings &gt; API &gt; Project URL</em>.
                </p>
              </div>

              {/* Anon Key Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                    Supabase Anon Public Key (API Key)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="text-[10px] text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-semibold cursor-pointer"
                  >
                    {showKey ? 'Nascondi' : 'Mostra'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-1">
                  Usa sempre la chiave pubblica <strong>anon</strong> (mai la service_role secret).
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testing || !url || !anonKey}
                  className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Verifica in corso...' : 'Testa Connessione'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salva Configurazione</span>
                </button>

                {savedSuccess && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Salvato!</span>
                  </span>
                )}
              </div>

              {/* Test Result Message */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold">{testResult.message}</div>
                    {testResult.latencyMs && (
                      <div className="text-[11px] opacity-80 mt-0.5">
                        Tempo di risposta: {testResult.latencyMs} ms
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sync controls */}
              {isSupabaseConfigured && (
                <div className="mt-4 pt-4 border-t border-stone-200 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                      Sincronizzazione Dati
                    </span>
                    {supabaseLastSyncedAt && (
                      <span className="text-[11px] text-stone-500 dark:text-zinc-400">
                        Ultimo sync: {new Date(supabaseLastSyncedAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleManualSyncPush}
                      disabled={syncing}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Invia Dati Locali a Supabase</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleManualSyncPull}
                      disabled={syncing}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                      <span>Scarica da Supabase</span>
                    </button>
                  </div>

                  {syncFeedback && (
                    <div className="text-xs text-stone-600 dark:text-zinc-300 italic pt-1">
                      {syncFeedback}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'exe' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/40 text-xs text-indigo-950 dark:text-indigo-200 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  <Laptop className="w-4 h-4 text-indigo-600" />
                  <span>Come eseguire il sito in locale con Supabase</span>
                </div>
                <p>
                  Quando avvii l'eseguibile <strong>Famiglia.exe</strong> sul tuo PC Windows, l'app viene eseguita localmente
                  senza bisogno di server remoti e si connette direttamente al tuo database Supabase!
                </p>
              </div>

              {/* Step by step */}
              <div className="space-y-2.5">
                <div className="flex gap-3 p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/70 dark:border-zinc-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    1
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-stone-900 dark:text-zinc-100">
                      Scarica il file eseguibile <code className="text-emerald-700 dark:text-emerald-400">Famiglia.exe</code>
                    </div>
                    <p className="text-stone-600 dark:text-zinc-400">
                      Il file eseguibile nativo per Windows 10 e 11 che avvia l'interfaccia in finestra autonoma.
                    </p>
                    <button
                      type="button"
                      onClick={() => downloadDirectWindowsExe('Famiglia.exe')}
                      className="mt-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Scarica Famiglia.exe (Pronto all'uso)</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/70 dark:border-zinc-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    2
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-stone-900 dark:text-zinc-100">
                      Scarica il file di configurazione <code className="text-emerald-700 dark:text-emerald-400">supabase.config.json</code>
                    </div>
                    <p className="text-stone-600 dark:text-zinc-400">
                      Salvalo nella stessa cartella dell'eseguibile. Famiglia.exe lo caricherà automaticamente all'avvio!
                    </p>
                    <button
                      type="button"
                      onClick={downloadConfigFile}
                      className="mt-1 px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-zinc-700 hover:bg-stone-300 dark:hover:bg-zinc-600 text-stone-800 dark:text-zinc-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Scarica supabase.config.json pre-configurato</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/70 dark:border-zinc-800">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    3
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-stone-900 dark:text-zinc-100">
                      Doppio clic su Famiglia.exe
                    </div>
                    <p className="text-stone-600 dark:text-zinc-400">
                      L'applicazione si apre all'istante, si collega al database Supabase ed è pronta all'uso quotidiano.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pacchetto Completo ZIP */}
              {onOpenDownloadModal && (
                <div className="p-3.5 rounded-xl border border-dashed border-stone-300 dark:border-zinc-700 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-stone-900 dark:text-zinc-100">Vuoi il pacchetto installer completo?</span>
                    <p className="text-stone-500 dark:text-zinc-400">Include l'installer automatico per creare l'icona sul Desktop.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDownloadModal();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold cursor-pointer hover:opacity-90"
                  >
                    Apri Finestra Download
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-900 dark:text-zinc-100">
                    Script SQL per inizializzare Supabase
                  </span>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400">
                    Incolla questo script in <em>Supabase Dashboard &gt; SQL Editor</em> per creare le tabelle e attivare la sincronizzazione Realtime.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copySqlToClipboard}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Copiato!' : 'Copia SQL'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={downloadSqlFile}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-200 dark:bg-zinc-800 hover:bg-stone-300 text-stone-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Scarica .sql</span>
                  </button>
                </div>
              </div>

              <div className="relative rounded-xl border border-stone-300 dark:border-zinc-800 bg-stone-900 text-stone-200 p-3 font-mono text-[11px] overflow-x-auto max-h-72 select-all">
                <pre>{SUPABASE_SCHEMA_SQL}</pre>
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-zinc-400">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Non hai ancora un account?</span>
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 hover:underline font-semibold"
                >
                  Crea un progetto gratuito su Supabase.com
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 dark:bg-zinc-950 p-4 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Famiglia ID: <strong>FAM-ROSSI-7829</strong></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-zinc-800 hover:bg-stone-300 dark:hover:bg-zinc-700 text-stone-800 dark:text-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
