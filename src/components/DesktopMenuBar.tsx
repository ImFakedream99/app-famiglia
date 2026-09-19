import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Download,
  FolderOpen,
  Save,
  RotateCcw,
  HelpCircle,
  Laptop,
  Plus,
  ChevronDown,
  Coins,
  Receipt,
  Wallet,
  PieChart,
  PiggyBank,
  Moon,
  Sun,
  Check,
  Zap,
  Keyboard,
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { ActiveTab } from '../types';
import {
  generateAndDownloadDesktopPackage,
  downloadDirectWindowsExe,
} from '../utils/executablePackager';

interface DesktopMenuBarProps {
  onOpenExpenseModal: () => void;
  onOpenDownloadModal: () => void;
  onOpenShortcutsModal?: () => void;
}

export const DesktopMenuBar: React.FC<DesktopMenuBarProps> = ({
  onOpenExpenseModal,
  onOpenDownloadModal,
  onOpenShortcutsModal,
}) => {
  const { setActiveTab, resetToDefaults, isHighContrastDark, toggleHighContrastDark, currentMember } = useFamily();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportJson = () => {
    try {
      const data = {
        members: localStorage.getItem('famiglia_members'),
        categories: localStorage.getItem('famiglia_categories'),
        oneTimeBudgets: localStorage.getItem('famiglia_one_time_budgets'),
        expenses: localStorage.getItem('famiglia_expenses'),
        allowanceConfigs: localStorage.getItem('famiglia_allowance_configs'),
        chores: localStorage.getItem('famiglia_chores'),
        requests: localStorage.getItem('famiglia_requests'),
        savingsGoals: localStorage.getItem('famiglia_savings_goals'),
        exportedAt: new Date().toISOString(),
        appName: 'Famiglia Desktop Database',
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `famiglia-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Errore durante esportazione database: ' + err);
    }
  };

  const handleImportJson = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (re) => {
        try {
          const parsed = JSON.parse(re.target?.result as string);
          if (parsed.members) localStorage.setItem('famiglia_members', parsed.members);
          if (parsed.expenses) localStorage.setItem('famiglia_expenses', parsed.expenses);
          if (parsed.categories) localStorage.setItem('famiglia_categories', parsed.categories);
          if (parsed.chores) localStorage.setItem('famiglia_chores', parsed.chores);
          if (parsed.requests) localStorage.setItem('famiglia_requests', parsed.requests);
          if (parsed.savingsGoals) localStorage.setItem('famiglia_savings_goals', parsed.savingsGoals);
          alert('Database locale importato con successo! Ricarico l’applicazione...');
          window.location.reload();
        } catch {
          alert('Il file selezionato non è un backup JSON valido.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const toggleMenu = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  return (
    <div
      ref={menuBarRef}
      id="desktop-native-menubar"
      className="bg-stone-800 text-stone-300 text-xs px-2 py-1 flex items-center border-b border-stone-700/80 shadow-xs select-none relative z-50"
    >
      {/* File Menu */}
      <div className="relative">
        <button
          onClick={() => toggleMenu('file')}
          className={`px-2.5 py-1 rounded hover:bg-stone-700 hover:text-white transition-colors cursor-pointer ${
            activeMenu === 'file' ? 'bg-stone-700 text-white' : ''
          }`}
        >
          File
        </button>
        {activeMenu === 'file' && (
          <div className="absolute left-0 mt-1 w-56 bg-stone-900 border border-stone-700 rounded-lg shadow-xl py-1 text-xs text-stone-200 animate-in fade-in-50">
            <button
              onClick={() => {
                onOpenExpenseModal();
                setActiveMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-stone-800 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Nuova Spesa</span>
              </span>
              <span className="text-[10px] text-stone-500 font-mono">Ctrl+E</span>
            </button>
            <div className="border-t border-stone-800 my-1" />
            <button
              onClick={() => {
                handleExportJson();
                setActiveMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-stone-800 flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5 text-indigo-400" />
              <span>Esporta Backup Dati (.json)</span>
            </button>
            <button
              onClick={() => {
                handleImportJson();
                setActiveMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-stone-800 flex items-center gap-2"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Importa Backup Dati (.json)</span>
            </button>
            <div className="border-t border-stone-800 my-1" />
            <button
              onClick={async () => {
                setActiveMenu(null);
                await downloadDirectWindowsExe();
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-emerald-950/60 text-emerald-300 flex items-center justify-between font-medium"
            >
              <span className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Scarica File .EXE Diretto</span>
              </span>
              <span className="text-[10px] text-emerald-500 font-mono">Ctrl+D</span>
            </button>
            <button
              onClick={() => {
                onOpenDownloadModal();
                setActiveMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-stone-800 text-stone-200 flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Windows Installer & Pacchetto (.zip)...</span>
            </button>
          </div>
        )}
      </div>

      {/* Finanze Menu */}
      <div className="relative">
        <button
          onClick={() => toggleMenu('finance')}
          className={`px-2.5 py-1 rounded hover:bg-stone-700 hover:text-white transition-colors cursor-pointer ${
            activeMenu === 'finance' ? 'bg-stone-700 text-white' : ''
          }`}
        >
          Finanze
        </button>
        {activeMenu === 'finance' && (
          <div className="absolute left-0 mt-1 w-56 bg-stone-900 border border-stone-700 rounded-lg shadow-xl py-1 text-xs text-stone-200 animate-in fade-in-50">
            <button
              onClick={() => {
                setActiveTab('overview');
                setActiveMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-stone-800 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <PieChart className="w-3.5 h-3.5 text-indigo-400" />
                <span>Panoramica Dashboard</span>
              </span>
              <span className="text-[10px] text-stone-500 font-mono">Ctrl+1</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('budget');
                setActiveMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-stone-800 flex items-center justify-between text-emerald-300"
            >
              <span className="flex items-center gap-2">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pianificazione Budget</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">Ctrl+B</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('expenses');
                setActiveMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-stone-800 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Receipt className="w-3.5 h-3.5 text-blue-400" />
                <span>Registro Spese & Scontrini</span>
              </span>
              <span className="text-[10px] text-stone-500 font-mono">Ctrl+3</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('allowances');
                setActiveMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-stone-800 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Paghette e Faccende</span>
              </span>
              <span className="text-[10px] text-stone-500 font-mono">Ctrl+4</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('savings');
                setActiveMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-stone-800 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <PiggyBank className="w-3.5 h-3.5 text-purple-400" />
                <span>Salvadanaio & Obiettivi</span>
              </span>
              <span className="text-[10px] text-stone-500 font-mono">Ctrl+5</span>
            </button>
          </div>
        )}
      </div>

      {/* Visualizza Menu */}
      <div className="relative">
        <button
          onClick={() => toggleMenu('view')}
          className={`px-2.5 py-1 rounded hover:bg-stone-700 hover:text-white transition-colors cursor-pointer ${
            activeMenu === 'view' ? 'bg-stone-700 text-white' : ''
          }`}
        >
          Visualizza
        </button>
        {activeMenu === 'view' && (
          <div className="absolute left-0 mt-1 w-64 bg-stone-900 border border-stone-700 rounded-lg shadow-xl py-1 text-xs text-stone-200 animate-in fade-in-50">
            <button
              onClick={() => {
                toggleHighContrastDark(currentMember.id);
                setActiveMenu(null);
              }}
              className="w-full text-left px-3 py-2 hover:bg-stone-800 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                {isHighContrastDark ? (
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Modalità Notturna (Alto Contrasto)</span>
              </span>
              <span className="text-[10px] text-stone-500 font-mono">Ctrl+Shift+D</span>
            </button>
            <div className="border-t border-stone-800 my-1" />
            <button
              onClick={() => {
                setActiveTab('family');
                setActiveMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-stone-800 text-stone-400 hover:text-stone-200 flex items-center gap-2"
            >
              <span>Preferenze display profilo...</span>
            </button>
          </div>
        )}
      </div>

      {/* Strumenti Menu */}
      <div className="relative">
        <button
          onClick={() => toggleMenu('tools')}
          className={`px-2.5 py-1 rounded hover:bg-stone-700 hover:text-white transition-colors cursor-pointer ${
            activeMenu === 'tools' ? 'bg-stone-700 text-white' : ''
          }`}
        >
          Strumenti
        </button>
        {activeMenu === 'tools' && (
          <div className="absolute left-0 mt-1 w-60 bg-stone-900 border border-stone-700 rounded-lg shadow-xl py-1 text-xs text-stone-200 animate-in fade-in-50">
            <button
              onClick={() => {
                setActiveTab('literacy');
                setActiveMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-stone-800 flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>Simulatori & Guide Didattiche</span>
            </button>
            <button
              onClick={async () => {
                setActiveMenu(null);
                await downloadDirectWindowsExe();
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-stone-800 flex items-center gap-2 text-emerald-300"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Scarica Famiglia-Installer.exe</span>
            </button>
            <button
              onClick={async () => {
                setActiveMenu(null);
                await generateAndDownloadDesktopPackage();
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-stone-800 flex items-center gap-2 text-indigo-300"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Genera Windows Installer (.zip)</span>
            </button>
            <div className="border-t border-stone-800 my-1" />
            <button
              onClick={() => {
                if (window.confirm('Vuoi davvero ripristinare i dati demo della Famiglia Rossi?')) {
                  resetToDefaults();
                }
                setActiveMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-rose-950/60 text-rose-300 flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Ripristina Dati Iniziali Demo</span>
            </button>
          </div>
        )}
      </div>

      {/* Aiuto Menu */}
      <div className="relative">
        <button
          onClick={() => toggleMenu('help')}
          className={`px-2.5 py-1 rounded hover:bg-stone-700 hover:text-white transition-colors cursor-pointer ${
            activeMenu === 'help' ? 'bg-stone-700 text-white' : ''
          }`}
        >
          Aiuto
        </button>
        {activeMenu === 'help' && (
          <div className="absolute left-0 mt-1 w-64 bg-stone-900 border border-stone-700 rounded-lg shadow-xl py-1 text-xs text-stone-200 animate-in fade-in-50">
            {onOpenShortcutsModal && (
              <button
                onClick={() => {
                  onOpenShortcutsModal();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-stone-800 flex items-center justify-between text-indigo-300"
              >
                <span className="flex items-center gap-2">
                  <Keyboard className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Scorciatoie da tastiera</span>
                </span>
                <span className="text-[10px] text-stone-400 font-mono">F1 o Ctrl+/</span>
              </button>
            )}
            <button
              onClick={() => {
                onOpenDownloadModal();
                setActiveMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-stone-800 flex items-center gap-2"
            >
              <Laptop className="w-3.5 h-3.5 text-emerald-400" />
              <span>Come installare ed eseguire l'app</span>
            </button>
            <div className="px-3 py-2 text-[11px] text-stone-400 border-t border-stone-800">
              <strong className="text-stone-200 block">Famiglia Desktop v2.4.0</strong>
              Funziona 100% in locale sul tuo computer con database offline e nessun tracciamento.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
