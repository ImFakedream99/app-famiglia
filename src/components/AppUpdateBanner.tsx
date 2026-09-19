import React, { useEffect, useState } from 'react';
import { Download, ExternalLink, RefreshCw, X } from 'lucide-react';
import { AppUpdateInfo, checkForAppUpdate } from '../lib/appUpdates';

const DISMISSED_UPDATE_KEY = 'famiglia_update_banner_dismissed';

export const AppUpdateBanner: React.FC = () => {
  const [update, setUpdate] = useState<AppUpdateInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [checking, setChecking] = useState(false);

  const check = async () => {
    setChecking(true);
    const result = await checkForAppUpdate();
    setUpdate(result);
    setChecking(false);
  };

  useEffect(() => {
    const dismissedCommit = localStorage.getItem(DISMISSED_UPDATE_KEY);
    let active = true;

    checkForAppUpdate().then((result) => {
      if (!active) return;
      setUpdate(result);
      if (result && dismissedCommit !== result.commit_sha) {
        setDismissed(false);
      }
    });

    const interval = window.setInterval(() => {
      checkForAppUpdate().then((result) => {
        if (!active) return;
        setUpdate(result);
      });
    }, 5 * 60 * 1000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  if (!update || dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISSED_UPDATE_KEY, update.commit_sha);
    setDismissed(true);
  };

  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
          {checking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-indigo-950">Nuovo aggiornamento disponibile</p>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-indigo-700 ring-1 ring-indigo-200">
              v{update.version}
            </span>
          </div>

          <p className="mt-0.5 text-xs text-indigo-900/80">
            È disponibile una nuova versione. Apri il download, installa il nuovo Famiglia e riapri l'app.
          </p>

          {update.commit_message && (
            <p className="mt-1 truncate text-[11px] font-medium text-indigo-800">
              {update.commit_message}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {update.download_url && (
              <a
                href={update.download_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
              >
                <Download className="h-3.5 w-3.5" />
                Scarica aggiornamento
              </a>
            )}

            <a
              href={update.commit_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              <Download className="h-3.5 w-3.5" />
              Dettagli
            </a>

            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              Ricordamelo dopo
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Chiudi notifica aggiornamento"
          className="rounded-lg p-1 text-indigo-500 hover:bg-indigo-100 hover:text-indigo-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
