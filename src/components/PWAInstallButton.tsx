import React, { useState } from 'react';
import { Download, Smartphone, Monitor, CheckCircle, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'settings';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'ios' | 'android' | 'desktop'>(
    isIOS ? 'ios' : isAndroid ? 'android' : 'desktop'
  );

  // If already installed as PWA in standalone mode, display a subtle installed badge or nothing in header
  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Applicazione installata correttamente sul dispositivo</span>
        </div>
      );
    }
    return null;
  }

  const handleAction = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          id="pwa-install-header-btn"
          onClick={handleAction}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200/80 rounded-xl shadow-xs transition-all cursor-pointer ${className}`}
          title="Scarica e installa l'app sul tuo telefono o PC"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
          <span className="hidden sm:inline">Scarica App</span>
          <span className="sm:hidden">Installa</span>
        </button>
      )}

      {variant === 'banner' && (
        <div
          id="pwa-install-banner"
          className={`bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-3.5 sm:p-4 rounded-2xl shadow-md border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Installa Famiglia sul tuo smartphone o PC</h4>
              <p className="text-xs text-emerald-100">
                Accedi istantaneamente dalla schermata Home come un'app nativa, anche offline e a schermo intero.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAction}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-emerald-900 bg-white hover:bg-emerald-50 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Scarica Ora</span>
            </button>
          </div>
        </div>
      )}

      {variant === 'settings' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-stone-50 border border-stone-200 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700 mt-0.5">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">Installazione come App nativa (PWA)</h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Salva l'applicazione sui telefoni dei genitori e dei figli per un accesso veloce senza aprire il browser.
              </p>
            </div>
          </div>
          <button
            onClick={handleAction}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Guida o Installa</span>
          </button>
        </div>
      )}

      {/* Installation Guide Modal */}
      {showGuideModal && (
        <div
          id="pwa-install-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGuideModal(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Scarica e Installa l'App</h3>
                  <p className="text-xs text-stone-500">Famiglia — Gestione Economica</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Install Action if available in browser */}
            {isInstallable && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
                <div className="text-xs text-emerald-800">
                  <strong>Installazione rapida rilevata!</strong> Premi il tasto per aggiungere subito alla schermata Home.
                </div>
                <button
                  onClick={async () => {
                    await install();
                    setShowGuideModal(false);
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shrink-0 cursor-pointer"
                >
                  Installa ora
                </button>
              </div>
            )}

            {/* Platform Selector Tabs */}
            <div className="mt-4 flex rounded-xl bg-stone-100 p-1 text-xs font-semibold">
              <button
                onClick={() => setActiveGuideTab('ios')}
                className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeGuideTab === 'ios'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>iPhone / iPad</span>
              </button>
              <button
                onClick={() => setActiveGuideTab('android')}
                className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeGuideTab === 'android'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>
              <button
                onClick={() => setActiveGuideTab('desktop')}
                className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeGuideTab === 'desktop'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>PC / Mac</span>
              </button>
            </div>

            {/* Tab Instructions */}
            <div className="mt-4 space-y-3 text-xs text-stone-600">
              {activeGuideTab === 'ios' && (
                <div className="space-y-2.5 bg-stone-50 p-3.5 rounded-xl border border-stone-200/80">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                      1
                    </span>
                    <p>
                      Apri l'app in <strong>Safari</strong> sul tuo iPhone o iPad.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                      2
                    </span>
                    <div className="flex-1">
                      Tocca l'icona di <strong>Condivisione</strong>{' '}
                      <Share2 className="w-3.5 h-3.5 inline text-blue-600 align-text-bottom mx-0.5" /> nella barra in basso di Safari.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                      3
                    </span>
                    <div className="flex-1">
                      Scorri le opzioni verso il basso e seleziona{' '}
                      <strong className="text-stone-900 inline-flex items-center gap-1">
                        <PlusSquare className="w-3.5 h-3.5 inline text-stone-700" /> Aggiungi a schermata Home
                      </strong>
                      .
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                      4
                    </span>
                    <p>
                      Conferma premendo <strong>Aggiungi</strong> in alto a destra: l'icona apparirà tra le tue app!
                    </p>
                  </div>
                </div>
              )}

              {activeGuideTab === 'android' && (
                <div className="space-y-2.5 bg-stone-50 p-3.5 rounded-xl border border-stone-200/80">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                      1
                    </span>
                    <p>
                      Apri l'app su <strong>Google Chrome</strong> o <strong>Samsung Internet</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                      2
                    </span>
                    <p>
                      Tocca il menu con i tre puntini (<strong>⋮</strong>) in alto a destra nel browser.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                      3
                    </span>
                    <p>
                      Seleziona <strong>"Installa app"</strong> oppure <strong>"Aggiungi a schermata Home"</strong>.
                    </p>
                  </div>
                </div>
              )}

              {activeGuideTab === 'desktop' && (
                <div className="space-y-2.5 bg-stone-50 p-3.5 rounded-xl border border-stone-200/80">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                      1
                    </span>
                    <p>
                      Su <strong>Chrome</strong> o <strong>Microsoft Edge</strong>, guarda la barra degli indirizzi in alto a destra.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                      2
                    </span>
                    <p>
                      Clicca sull'icona <strong>Installa</strong> (icona a forma di computer o freccia verso il basso nella barra URL).
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                      3
                    </span>
                    <p>
                      L'app si aprirà in una finestra indipendente senza barre del browser e sarà disponibile nel menu Start o Launchpad.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-stone-200/60 text-[11px] text-stone-500">
                    💡 <strong>Utente Windows?</strong> Puoi anche scaricare direttamente il file <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">.exe</code> o l'installer con creazione automatica cliccando su <em>"Scarica per Windows (.exe)"</em> nella barra superiore.
                  </div>
                </div>
              )}
            </div>

            {/* Benefits footer */}
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Nessuno store richiesto • Gratuito • Leggero</span>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
