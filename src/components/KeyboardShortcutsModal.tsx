import React from 'react';
import {
  Keyboard,
  X,
  PlusCircle,
  PieChart,
  Receipt,
  Coins,
  PiggyBank,
  GraduationCap,
  FileSpreadsheet,
  Users,
  Moon,
  Laptop,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenExpenseModal?: () => void;
  onOpenDownloadModal?: () => void;
  onSelectTab?: (tab: ActiveTab) => void;
  onToggleTheme?: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  onOpenExpenseModal,
  onOpenDownloadModal,
  onSelectTab,
  onToggleTheme,
}) => {
  if (!isOpen) return null;

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
  const modKey = isMac ? '⌘' : 'Ctrl';

  const primaryActions = [
    {
      combo: [`${modKey}`, 'E'],
      altCombo: [`${modKey}`, 'N'],
      label: 'Nuova Spesa',
      desc: 'Apre subito la finestra per registrare un nuovo scontrino o spesa',
      icon: PlusCircle,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      action: () => {
        onClose();
        onOpenExpenseModal?.();
      },
    },
    {
      combo: [`${modKey}`, 'B'],
      altCombo: [`${modKey}`, '2'],
      label: 'Vista Budget',
      desc: 'Passa alla schermata di allocazione e monitoraggio dei tetti di spesa',
      icon: PieChart,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      action: () => {
        onClose();
        onSelectTab?.('budget');
      },
    },
    {
      combo: [`${modKey}`, 'D'],
      label: 'Scarica per Windows',
      desc: 'Apre il download dell\'installer o del file Famiglia.exe diretto',
      icon: Laptop,
      iconColor: 'text-teal-600 dark:text-teal-400',
      action: () => {
        onClose();
        onOpenDownloadModal?.();
      },
    },
    {
      combo: [`${modKey}`, 'Shift', 'D'],
      label: 'Modalità Notturna',
      desc: 'Inverte tema chiaro / scuro ad alto contrasto per affaticamento visivo',
      icon: Moon,
      iconColor: 'text-purple-600 dark:text-purple-400',
      action: () => {
        onToggleTheme?.();
      },
    },
    {
      combo: ['Esc'],
      label: 'Chiudi Finestre',
      desc: 'Chiude qualsiasi modale attiva o annulla l\'operazione in corso',
      icon: X,
      iconColor: 'text-stone-500',
      action: onClose,
    },
  ];

  const navigationTabs = [
    {
      combo: [`${modKey}`, '1'],
      altCombo: [`${modKey}`, 'O'],
      label: 'Panoramica',
      tab: 'overview' as ActiveTab,
      icon: PieChart,
    },
    {
      combo: [`${modKey}`, '2'],
      altCombo: [`${modKey}`, 'B'],
      label: 'Budget',
      tab: 'budget' as ActiveTab,
      icon: PieChart,
    },
    {
      combo: [`${modKey}`, '3'],
      label: 'Spese',
      tab: 'expenses' as ActiveTab,
      icon: Receipt,
    },
    {
      combo: [`${modKey}`, '4'],
      altCombo: [`${modKey}`, 'P'],
      label: 'Paghette & Compiti',
      tab: 'allowances' as ActiveTab,
      icon: Coins,
    },
    {
      combo: [`${modKey}`, '5'],
      altCombo: [`${modKey}`, 'S'],
      label: 'Salvadanaio & Obiettivi',
      tab: 'savings' as ActiveTab,
      icon: PiggyBank,
    },
    {
      combo: [`${modKey}`, '6'],
      label: 'Fondi Extra',
      tab: 'requests' as ActiveTab,
      icon: PlusCircle,
    },
    {
      combo: [`${modKey}`, '7'],
      label: 'Edu Finanziaria',
      tab: 'literacy' as ActiveTab,
      icon: GraduationCap,
    },
    {
      combo: [`${modKey}`, '8'],
      altCombo: [`${modKey}`, 'R'],
      label: 'Report & Statistiche',
      tab: 'reports' as ActiveTab,
      icon: FileSpreadsheet,
    },
    {
      combo: [`${modKey}`, '9'],
      label: 'Gestione Famiglia',
      tab: 'family' as ActiveTab,
      icon: Users,
    },
  ];

  return (
    <div
      id="keyboard-shortcuts-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="bg-stone-900 dark:bg-black text-white p-5 flex items-center justify-between border-b border-stone-800 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Scorciatoie da Tastiera</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-500/30">
                  {isMac ? 'macOS Shortcuts' : 'Windows & Linux'}
                </span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Aumenta la produttività con i comandi rapidi globali di Famiglia
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

        {/* Modal Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Section 1: Key Actions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 mb-3 flex items-center gap-1.5">
              <span>Azioni Rapide Fondamentali</span>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {primaryActions.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={item.action}
                    className="w-full text-left p-2.5 rounded-xl border border-stone-200/80 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/40 dark:hover:bg-zinc-800/60 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className={`w-4 h-4 ${item.iconColor}`} />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-xs text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                          <span>{item.label}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-zinc-400 truncate">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        {item.combo.map((key, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 border border-stone-300 dark:border-zinc-700 shadow-2xs font-bold"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                      {item.altCombo && (
                        <>
                          <span className="text-stone-400 text-[10px]">o</span>
                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            {item.altCombo.map((key, kIdx) => (
                              <kbd
                                key={kIdx}
                                className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 border border-stone-300 dark:border-zinc-700 shadow-2xs font-bold"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Tab Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 mb-3">
              Navigazione Rapida Viste
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {navigationTabs.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onClose();
                      onSelectTab?.(item.tab);
                    }}
                    className="p-2.5 rounded-xl border border-stone-200/80 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/40 dark:hover:bg-zinc-800/60 transition-all flex items-center justify-between gap-2 group cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className="w-3.5 h-3.5 text-stone-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0" />
                      <span className="text-xs font-medium text-stone-800 dark:text-zinc-200 truncate">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[11px] shrink-0">
                      {item.combo.map((key, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 border border-stone-300 dark:border-zinc-700 shadow-2xs font-bold text-[10px]"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Help and Trigger Tip */}
          <div className="p-3 bg-stone-50 dark:bg-zinc-950 border border-stone-200 dark:border-zinc-800 rounded-xl flex items-center justify-between text-xs text-stone-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                Puoi aprire questo pannello in qualsiasi momento premendo <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 font-mono text-[10px] font-bold">F1</kbd>, <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 font-mono text-[10px] font-bold">{modKey}+/</kbd> oppure <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 font-mono text-[10px] font-bold">?</kbd>.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 dark:bg-zinc-950 p-4 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-[11px] text-stone-500 dark:text-zinc-400">
            💡 Suggerimento: Fai clic su qualsiasi riga per eseguire subito l'azione associata.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            Ho capito
          </button>
        </div>
      </div>
    </div>
  );
};
