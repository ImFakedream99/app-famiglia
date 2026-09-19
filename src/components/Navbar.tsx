import React, { useState, useRef, useEffect } from 'react';
import {
  Users,
  Bell,
  Plus,
  ChevronDown,
  Wallet,
  PieChart,
  Receipt,
  PiggyBank,
  CheckSquare,
  GraduationCap,
  FileSpreadsheet,
  AlertTriangle,
  Coins,
  Check,
  ShieldCheck,
  Sparkles,
  Laptop,
  Moon,
  Sun,
  Keyboard,
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { ActiveTab, NotificationItem } from '../types';
import { calculateAge, formatDateTime } from '../utils/formatters';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  onOpenExpenseModal: () => void;
  onOpenDownloadModal?: () => void;
  onOpenShortcutsModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenExpenseModal,
  onOpenDownloadModal,
  onOpenShortcutsModal,
}) => {
  const {
    currentMember,
    members,
    activeTab,
    setActiveTab,
    switchMember,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    requests,
    isHighContrastDark,
    toggleHighContrastDark,
  } = useFamily();

  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  const memberDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        memberDropdownRef.current &&
        !memberDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMemberDropdownOpen(false);
      }
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications visible to current member
  const visibleNotifications = notifications.filter(
    (n) =>
      n.targetRole === 'all' ||
      n.targetRole === currentMember.role ||
      (n.targetMemberId && n.targetMemberId === currentMember.id)
  );

  const unreadCount = visibleNotifications.filter((n) => !n.isRead).length;
  const pendingRequestsCount = requests.filter((r) => r.status === 'pending').length;

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number;
    shortcutKey?: string;
  }[] = [
    { id: 'overview', label: 'Panoramica', icon: PieChart, shortcutKey: 'Ctrl+1' },
    { id: 'budget', label: 'Budget', icon: Wallet, shortcutKey: 'Ctrl+B' },
    { id: 'expenses', label: 'Spese', icon: Receipt, shortcutKey: 'Ctrl+3' },
    { id: 'allowances', label: 'Paghette & Compiti', icon: Coins, shortcutKey: 'Ctrl+4' },
    { 
      id: 'requests', 
      label: 'Fondi Extra', 
      icon: Plus, 
      badge: currentMember.role === 'parent' ? pendingRequestsCount : undefined,
      shortcutKey: 'Ctrl+6',
    },
    { id: 'savings', label: 'Salvadanaio', icon: PiggyBank, shortcutKey: 'Ctrl+5' },
    { id: 'literacy', label: 'Edu Finanziaria', icon: GraduationCap, shortcutKey: 'Ctrl+7' },
    { id: 'reports', label: 'Report', icon: FileSpreadsheet, shortcutKey: 'Ctrl+8' },
    { id: 'family', label: 'Famiglia', icon: Users, shortcutKey: 'Ctrl+9' },
  ];

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'budget_alert':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'allowance_paid':
        return <Coins className="w-4 h-4 text-emerald-500" />;
      case 'extra_request':
        return <Plus className="w-4 h-4 text-indigo-500" />;
      case 'chore_submitted':
        return <CheckSquare className="w-4 h-4 text-blue-500" />;
      case 'chore_approved':
        return <Check className="w-4 h-4 text-emerald-500" />;
      case 'goal_reached':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-stone-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Family Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-indigo-200">
              F
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-stone-900 tracking-tight text-base">Famiglia</span>
                <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
                  Rossi
                </span>
              </div>
              <p className="text-[11px] text-stone-600 font-medium -mt-0.5">Gestione Finanziaria</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Pill style similar to reference image) */}
          <nav className="hidden md:flex items-center space-x-1 bg-stone-100/80 p-1 rounded-2xl border border-stone-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={item.shortcutKey ? `${item.label} (${item.shortcutKey})` : item.label}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center -mr-1">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Desktop Executable Package Launcher */}
            {onOpenDownloadModal && (
              <button
                onClick={onOpenDownloadModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700/60 rounded-xl shadow-xs transition-all cursor-pointer"
                title="Scarica l'app per Windows: installer automatico o file .exe diretto (Ctrl+D)"
              >
                <Laptop className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Scarica per Windows (.exe)</span>
              </button>
            )}

            {/* PWA Download / Install App Button */}
            <PWAInstallButton variant="header" />

            {/* Quick Record Expense Button */}
            <button
              onClick={onOpenExpenseModal}
              title="Registra una nuova spesa (Ctrl+E o Ctrl+N)"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nuova Spesa</span>
              <kbd className="hidden lg:inline text-[9px] bg-indigo-700/90 text-indigo-100 px-1 py-0.5 rounded font-mono ml-0.5 shadow-2xs">
                Ctrl+E
              </kbd>
            </button>

            {/* Keyboard Shortcuts Cheatsheet Button */}
            {onOpenShortcutsModal && (
              <button
                onClick={onOpenShortcutsModal}
                className="relative p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Scorciatoie da tastiera (F1 o Ctrl+/)"
                aria-label="Apri scorciatoie da tastiera"
              >
                <Keyboard className="w-4 h-4" />
              </button>
            )}

            {/* Quick High-Contrast Dark Mode Toggle (Night-time mobile) */}
            <button
              onClick={() => toggleHighContrastDark(currentMember.id)}
              className="relative p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              title={isHighContrastDark ? "Passa a modalità diurna (Ctrl+Shift+D)" : "Passa a modalità notturna ad alto contrasto (Ctrl+Shift+D)"}
              aria-label="Attiva/disattiva modalità notturna ad alto contrasto"
            >
              {isHighContrastDark ? (
                <Moon className="w-4 h-4 text-indigo-400 animate-in spin-in-90 duration-200" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500 animate-in spin-in-90 duration-200" />
              )}
            </button>

            {/* Notifications Bell Dropdown */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                className="relative p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                title="Notifiche"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {isNotifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-stone-100">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-stone-900">Notifiche Famiglia</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-full">
                          {unreadCount} nuove
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Segna lette
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-50">
                    {visibleNotifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-stone-400">
                        Nessuna notifica presente.
                      </div>
                    ) : (
                      visibleNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.linkTab) setActiveTab(n.linkTab as ActiveTab);
                            setIsNotifDropdownOpen(false);
                          }}
                          className={`p-3 text-xs cursor-pointer hover:bg-stone-50 transition-colors flex items-start gap-2.5 ${
                            !n.isRead ? 'bg-indigo-50/30' : ''
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-stone-100 shrink-0 mt-0.5">
                            {getNotifIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-stone-900 truncate">{n.title}</p>
                            <p className="text-stone-600 text-[11px] line-clamp-2 mt-0.5">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-stone-400 block mt-1">
                              {formatDateTime(n.timestamp)}
                            </span>
                          </div>
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Member Profile Switcher (Genitore vs Figlio) */}
            <div className="relative" ref={memberDropdownRef}>
              <button
                onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 bg-stone-100/90 hover:bg-stone-200/70 border border-stone-200/80 rounded-2xl transition-colors text-left"
              >
                <div className={`w-7 h-7 rounded-xl ${currentMember.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}>
                  {currentMember.name.charAt(0)}
                </div>
                <div className="hidden sm:block leading-tight pr-1">
                  <div className="text-xs font-bold text-stone-900 truncate max-w-[100px]">
                    {currentMember.name}
                  </div>
                  <div className="text-[10px] font-medium text-stone-600 flex items-center gap-1">
                    {currentMember.role === 'parent' ? (
                      <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> Genitore
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold">
                        Figlio ({calculateAge(currentMember.birthDate)}a)
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 mr-1" />
              </button>

              {isMemberDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 border-b border-stone-100">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      Cambia Profilo Famiglia
                    </span>
                  </div>

                  <div className="p-1 space-y-0.5">
                    {members.map((m) => {
                      const isSelected = m.id === currentMember.id;
                      const age = calculateAge(m.birthDate);
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            switchMember(m.id);
                            setIsMemberDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors ${
                            isSelected
                              ? 'bg-indigo-50/80 text-indigo-900 font-medium'
                              : 'hover:bg-stone-50 text-stone-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-xl ${m.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                              {m.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-stone-900">{m.name}</div>
                              <div className="text-[10px] text-stone-600">
                                {m.role === 'parent' ? 'Genitore (Admin)' : `Figlio (${age} anni)`}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Profile Preference: High-Contrast Dark Mode Toggle */}
                  <div className="pt-2 mt-1 border-t border-stone-100 px-3 py-2 bg-stone-50/50 rounded-b-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg bg-stone-200/60 text-stone-700">
                          {isHighContrastDark ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                        </div>
                        <div>
                          <span className="text-xs font-semibold text-stone-800 block leading-tight">Uso Notturno</span>
                          <span className="text-[10px] text-stone-500 block leading-tight">Alto contrasto</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleHighContrastDark(currentMember.id)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isHighContrastDark ? 'bg-indigo-600' : 'bg-stone-300'
                        }`}
                        aria-label="Attiva tema notturno ad alto contrasto per questo profilo"
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            isHighContrastDark ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="pt-1.5 px-3 pb-1">
                    <button
                      onClick={() => {
                        setActiveTab('family');
                        setIsMemberDropdownOpen(false);
                      }}
                      className="w-full text-center text-xs text-indigo-600 hover:text-indigo-800 font-semibold py-1 hover:bg-indigo-50/50 rounded-lg transition-colors"
                    >
                      Gestisci Membri & Profilo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Scrollable Bar */}
        <div className="md:hidden flex items-center space-x-1 overflow-x-auto py-2 border-t border-stone-100 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl shrink-0 ${
                  isActive
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
