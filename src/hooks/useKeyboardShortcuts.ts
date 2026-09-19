import { useEffect, useState, useCallback } from 'react';
import { ActiveTab } from '../types';

export interface ShortcutToastInfo {
  id: number;
  label: string;
  combo: string;
}

export interface UseKeyboardShortcutsOptions {
  onOpenExpenseModal: () => void;
  onOpenDownloadModal: () => void;
  onOpenShortcutsModal: () => void;
  onCloseAllModals: () => void;
  onToggleTheme: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  isAnyModalOpen?: boolean;
}

export const useKeyboardShortcuts = ({
  onOpenExpenseModal,
  onOpenDownloadModal,
  onOpenShortcutsModal,
  onCloseAllModals,
  onToggleTheme,
  onSelectTab,
  isAnyModalOpen = false,
}: UseKeyboardShortcutsOptions) => {
  const [toast, setToast] = useState<ShortcutToastInfo | null>(null);

  const showToast = useCallback((label: string, combo: string) => {
    const id = Date.now();
    setToast({ id, label, combo });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 1800);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      // 1. ESCAPE: Always closes any open modal or dismisses current active dialog
      if (e.key === 'Escape') {
        if (isAnyModalOpen) {
          e.preventDefault();
          onCloseAllModals();
          showToast('Finestra chiusa', 'Esc');
          return;
        }
      }

      // 2. F1: Help / Shortcuts modal
      if (e.key === 'F1') {
        e.preventDefault();
        onOpenShortcutsModal();
        showToast('Guida Scorciatoie', 'F1');
        return;
      }

      // 3. Question mark '?' when not typing in an input
      if (e.key === '?' && !isInputFocused && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        onOpenShortcutsModal();
        showToast('Guida Scorciatoie', '?');
        return;
      }

      // Check modifier: Ctrl on Windows/Linux or Cmd on macOS
      const hasModifier = e.ctrlKey || e.metaKey;

      if (!hasModifier) {
        return;
      }

      const key = e.key.toLowerCase();
      const isShift = e.shiftKey;
      const modifierLabel = navigator.platform.toUpperCase().includes('MAC') ? '⌘' : 'Ctrl';

      // 4. Ctrl + / or Cmd + / : Open Shortcuts Cheat Sheet
      if (e.key === '/' || e.code === 'Slash') {
        e.preventDefault();
        onOpenShortcutsModal();
        showToast('Guida Scorciatoie', `${modifierLabel}+/`);
        return;
      }

      // 5. Ctrl + Shift + D / L : Toggle Dark / Light Theme
      if (isShift && (key === 'd' || key === 'l')) {
        e.preventDefault();
        onToggleTheme();
        showToast('Tema Invertito', `${modifierLabel}+Shift+${key.toUpperCase()}`);
        return;
      }

      // 6. Ctrl + E (Requested: Open Expense Modal)
      if (!isShift && key === 'e') {
        e.preventDefault();
        onOpenExpenseModal();
        showToast('Nuova Spesa', `${modifierLabel}+E`);
        return;
      }

      // 7. Ctrl + N : Open Expense Modal (Standard desktop new item)
      if (!isShift && key === 'n') {
        e.preventDefault();
        onOpenExpenseModal();
        showToast('Nuova Spesa', `${modifierLabel}+N`);
        return;
      }

      // 8. Ctrl + B (Requested: Budget View)
      if (!isShift && key === 'b') {
        e.preventDefault();
        onSelectTab('budget');
        showToast('Vista Budget', `${modifierLabel}+B`);
        return;
      }

      // 9. Ctrl + D : Open Windows Executable / Download Modal
      if (!isShift && key === 'd') {
        e.preventDefault();
        onOpenDownloadModal();
        showToast('Scarica App Desktop', `${modifierLabel}+D`);
        return;
      }

      // If user is actively typing in a form input, avoid hijacking regular number typing or text
      if (isInputFocused) {
        return;
      }

      // 10. Number Keys (Ctrl + 1 ... 9) Navigation
      switch (key) {
        case '1':
          e.preventDefault();
          onSelectTab('overview');
          showToast('Panoramica', `${modifierLabel}+1`);
          break;
        case '2':
          e.preventDefault();
          onSelectTab('budget');
          showToast('Vista Budget', `${modifierLabel}+2`);
          break;
        case '3':
          e.preventDefault();
          onSelectTab('expenses');
          showToast('Tutte le Spese', `${modifierLabel}+3`);
          break;
        case '4':
          e.preventDefault();
          onSelectTab('allowances');
          showToast('Paghette & Compiti', `${modifierLabel}+4`);
          break;
        case '5':
          e.preventDefault();
          onSelectTab('savings');
          showToast('Salvadanaio & Obiettivi', `${modifierLabel}+5`);
          break;
        case '6':
          e.preventDefault();
          onSelectTab('requests');
          showToast('Fondi Extra', `${modifierLabel}+6`);
          break;
        case '7':
          e.preventDefault();
          onSelectTab('literacy');
          showToast('Edu Finanziaria', `${modifierLabel}+7`);
          break;
        case '8':
          e.preventDefault();
          onSelectTab('reports');
          showToast('Report Finanziari', `${modifierLabel}+8`);
          break;
        case '9':
          e.preventDefault();
          onSelectTab('family');
          showToast('Gestione Famiglia', `${modifierLabel}+9`);
          break;
        case 'o':
          e.preventDefault();
          onSelectTab('overview');
          showToast('Panoramica', `${modifierLabel}+O`);
          break;
        case 'p':
          e.preventDefault();
          onSelectTab('allowances');
          showToast('Paghette & Compiti', `${modifierLabel}+P`);
          break;
        case 's':
          e.preventDefault();
          onSelectTab('savings');
          showToast('Salvadanaio', `${modifierLabel}+S`);
          break;
        case 'r':
          e.preventDefault();
          onSelectTab('reports');
          showToast('Report Finanziari', `${modifierLabel}+R`);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onOpenExpenseModal,
    onOpenDownloadModal,
    onOpenShortcutsModal,
    onCloseAllModals,
    onToggleTheme,
    onSelectTab,
    isAnyModalOpen,
    showToast,
  ]);

  return { toast, showToast };
};
