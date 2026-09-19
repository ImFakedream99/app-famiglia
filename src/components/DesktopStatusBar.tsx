import React from 'react';
import { Database, HardDrive, Download, ShieldCheck, Wifi, WifiOff, Keyboard } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface DesktopStatusBarProps {
  onOpenDownloadModal: () => void;
  onOpenShortcutsModal?: () => void;
}

export const DesktopStatusBar: React.FC<DesktopStatusBarProps> = ({
  onOpenDownloadModal,
  onOpenShortcutsModal,
}) => {
  const { expenses, members, currentMember } = useFamily();
  const isOnline = useOnlineStatus();

  return (
    <footer
      id="desktop-native-statusbar"
      className="bg-stone-900 text-stone-400 text-[11px] px-3 py-1 flex items-center justify-between border-t border-stone-800 select-none shrink-0"
    >
      {/* Left items */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-stone-300 font-medium">
          <Database className="w-3 h-3 text-emerald-400" />
          <span>Famiglia DB</span>
          <span className="text-stone-600">|</span>
          <span className="text-stone-400">{expenses.length} spese registrate</span>
          <span className="text-stone-600">|</span>
          <span className="text-stone-400">{members.length} membri</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-stone-800 text-stone-400">
          <ShieldCheck className="w-3 h-3 text-indigo-400" />
          <span>Profilo attivo: <strong className="text-stone-200">{currentMember.name}</strong></span>
        </div>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-3">
        {/* Network / Offline state */}
        <div className="flex items-center gap-1">
          {isOnline ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <Wifi className="w-3 h-3" />
              <span className="hidden md:inline text-[10px]">Online</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <WifiOff className="w-3 h-3" />
              <span className="text-[10px]">Offline (Dati Locali)</span>
            </span>
          )}
        </div>

        {/* Global Shortcuts trigger button */}
        {onOpenShortcutsModal && (
          <button
            onClick={onOpenShortcutsModal}
            className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors cursor-pointer text-[10px] font-mono"
            title="Visualizza tutte le scorciatoie da tastiera (F1 o Ctrl+/)"
          >
            <Keyboard className="w-3 h-3 text-indigo-400" />
            <span className="text-emerald-400">Ctrl+E</span>
            <span className="text-stone-500">·</span>
            <span className="text-emerald-400">Ctrl+B</span>
            <span className="text-stone-500">·</span>
            <span className="text-stone-400">F1 Aiuto</span>
          </button>
        )}

        {/* Download Executable trigger */}
        <button
          onClick={onOpenDownloadModal}
          className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer font-medium"
        >
          <Download className="w-3 h-3" />
          <span>Scarica Pacchetto (.zip / .exe)</span>
        </button>
      </div>
    </footer>
  );
};

