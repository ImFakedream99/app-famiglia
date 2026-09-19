import React from 'react';
import { Command, Zap } from 'lucide-react';
import { ShortcutToastInfo } from '../hooks/useKeyboardShortcuts';

interface ShortcutToastProps {
  toast: ShortcutToastInfo | null;
}

export const ShortcutToast: React.FC<ShortcutToastProps> = ({ toast }) => {
  if (!toast) return null;

  return (
    <div
      id="shortcut-hud-toast"
      className="fixed bottom-12 right-6 z-50 pointer-events-none transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="bg-stone-900/95 dark:bg-black/95 text-white text-xs px-3.5 py-2 rounded-xl shadow-2xl border border-stone-700/80 dark:border-zinc-800 flex items-center gap-2.5 backdrop-blur-md">
        <div className="w-5 h-5 rounded-md bg-emerald-600/30 text-emerald-400 flex items-center justify-center">
          <Zap className="w-3 h-3 text-emerald-400" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] bg-stone-800 dark:bg-zinc-800 text-stone-200 px-1.5 py-0.5 rounded border border-stone-700 dark:border-zinc-700 font-semibold shadow-xs">
            {toast.combo}
          </span>
          <span className="font-medium text-stone-200">{toast.label}</span>
        </div>
      </div>
    </div>
  );
};
