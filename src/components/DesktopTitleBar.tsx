import React, { useState, useEffect } from 'react';
import {
  Download,
  Maximize2,
  Minimize2,
  Minus,
  Square,
  X,
  HardDrive,
  Laptop,
} from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface DesktopTitleBarProps {
  onOpenDownloadModal: () => void;
}

export const DesktopTitleBar: React.FC<DesktopTitleBarProps> = ({
  onOpenDownloadModal,
}) => {
  const isOnline = useOnlineStatus();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      id="desktop-native-titlebar"
      className="bg-stone-900 text-stone-200 text-xs px-3 py-1.5 flex items-center justify-between select-none border-b border-stone-800 shadow-inner"
    >
      {/* Left: Window Dots & App Brand */}
      <div className="flex items-center gap-3">
        {/* macOS Style Traffic Lights / Window Controls */}
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer flex items-center justify-center group"
            title="Chiudi finestra desktop"
            onClick={() => {
              if (window.confirm("Vuoi chiudere l'applicazione Famiglia?")) {
                window.close();
              }
            }}
          >
            <X className="w-2 h-2 text-rose-950 opacity-0 group-hover:opacity-100" />
          </div>
          <div
            className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 transition-colors cursor-pointer flex items-center justify-center group"
            title="Minimizza"
            onClick={() => {}}
          >
            <Minus className="w-2 h-2 text-amber-950 opacity-0 group-hover:opacity-100" />
          </div>
          <div
            className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors cursor-pointer flex items-center justify-center group"
            title="Schermo Intero Desktop"
            onClick={toggleFullscreen}
          >
            <Square className="w-1.5 h-1.5 text-emerald-950 opacity-0 group-hover:opacity-100" />
          </div>
        </div>

        {/* Desktop Application Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-stone-700/60">
          <div className="flex items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-stone-100 tracking-tight">Famiglia Desktop</span>
            <span className="text-[10px] bg-stone-800 text-stone-300 font-mono px-1.5 py-0.5 rounded border border-stone-700">
              v2.4 Standalone
            </span>
          </div>
        </div>
      </div>

      {/* Center: Window Title Drag Bar */}
      <div className="hidden md:flex items-center gap-2 text-stone-400 text-[11px]">
        <HardDrive className="w-3 h-3 text-emerald-400" />
        <span>Database Locale: Memoria Autonoma Attiva</span>
        <span className="text-stone-600">•</span>
        <span className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span>{isOnline ? 'Sincronizzato' : 'Offline (Modalità Locale)'}</span>
        </span>
      </div>

      {/* Right: Actions (Download Executable & Window State) */}
      <div className="flex items-center gap-2">
        {/* Prominent Download Executable Button */}
        <button
          onClick={onOpenDownloadModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors cursor-pointer shadow-xs"
          title="Scarica per Windows: installer automatico o file .exe diretto"
        >
          <Download className="w-3 h-3" />
          <span>Scarica per Windows (.exe)</span>
        </button>

        {/* Fullscreen Toggle Button */}
        <button
          onClick={toggleFullscreen}
          className="p-1 rounded text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          title={isFullscreen ? 'Riduci a finestra' : 'Schermo intero nativo'}
        >
          {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
};
