import React, { useState } from 'react';
import { FamilyProvider, useFamily } from './context/FamilyContext';
import { AuthGate } from './components/AuthGate';
import { DesktopTitleBar } from './components/DesktopTitleBar';
import { DesktopMenuBar } from './components/DesktopMenuBar';
import { DesktopStatusBar } from './components/DesktopStatusBar';
import { DownloadExecutableModal } from './components/DownloadExecutableModal';
import { Navbar } from './components/Navbar';
import { OverviewView } from './components/OverviewView';
import { BudgetView } from './components/BudgetView';
import { ExpensesView } from './components/ExpensesView';
import { AllowanceView } from './components/AllowanceView';
import { SavingsView } from './components/SavingsView';
import { ExtraRequestsView } from './components/ExtraRequestsView';
import { FinancialLiteracyView } from './components/FinancialLiteracyView';
import { ReportsView } from './components/ReportsView';
import { FamilySettingsView } from './components/FamilySettingsView';
import { ExpenseModal } from './components/ExpenseModal';
import { ReceiptPreviewModal } from './components/ReceiptPreviewModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ShortcutToast } from './components/ShortcutToast';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Expense } from './types';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, toggleHighContrastDark, currentMember } = useFamily();

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [previewExpense, setPreviewExpense] = useState<Expense | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return localStorage.getItem('famiglia_pwa_banner_dismissed') === 'true';
  });

  const handleCloseAllModals = () => {
    setIsExpenseModalOpen(false);
    setIsDownloadModalOpen(false);
    setIsShortcutsModalOpen(false);
    setPreviewExpense(null);
  };

  const isAnyModalOpen =
    isExpenseModalOpen ||
    isDownloadModalOpen ||
    isShortcutsModalOpen ||
    previewExpense !== null;

  // Global Keyboard Shortcuts hook
  const { toast } = useKeyboardShortcuts({
    onOpenExpenseModal: () => setIsExpenseModalOpen(true),
    onOpenDownloadModal: () => setIsDownloadModalOpen(true),
    onOpenShortcutsModal: () => setIsShortcutsModalOpen(true),
    onCloseAllModals: handleCloseAllModals,
    onToggleTheme: () => toggleHighContrastDark(currentMember.id),
    onSelectTab: (tab) => setActiveTab(tab),
    isAnyModalOpen,
  });

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem('famiglia_pwa_banner_dismissed', 'true');
  };

  return (
    <div className="min-h-screen bg-stone-50/50 dark:bg-[#09090b] text-stone-900 dark:text-zinc-100 flex flex-col font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-200">
      {/* Desktop Native Window Titlebar */}
      <DesktopTitleBar onOpenDownloadModal={() => setIsDownloadModalOpen(true)} />

      {/* Desktop Native Menu Bar (File, Finanze, Strumenti, Aiuto) */}
      <DesktopMenuBar
        onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
      />

      {/* Main Navigation & Profile Switcher */}
      <Navbar
        onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Prominent Download / Install App Banner (dismissible) */}
        {!bannerDismissed && (
          <div className="relative">
            <PWAInstallButton variant="banner" />
            <button
              onClick={handleDismissBanner}
              className="absolute top-3 right-3 text-white/70 hover:text-white text-xs p-1 rounded-md hover:bg-white/10 transition-colors"
              title="Nascondi avviso"
            >
              ✕
            </button>
          </div>
        )}

        {activeTab === 'overview' && (
          <OverviewView
            onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
            onViewReceipt={(expense) => setPreviewExpense(expense)}
          />
        )}
        {activeTab === 'budget' && <BudgetView />}
        {activeTab === 'expenses' && (
          <ExpensesView
            onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
            onViewReceipt={(expense) => setPreviewExpense(expense)}
          />
        )}
        {activeTab === 'allowances' && <AllowanceView />}
        {activeTab === 'savings' && <SavingsView />}
        {activeTab === 'requests' && <ExtraRequestsView />}
        {activeTab === 'literacy' && <FinancialLiteracyView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'family' && <FamilySettingsView />}
      </main>

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />

      <ReceiptPreviewModal
        expense={previewExpense}
        onClose={() => setPreviewExpense(null)}
      />

      {/* Central Download Executable Modal */}
      <DownloadExecutableModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        onOpenExpenseModal={() => {
          setIsShortcutsModalOpen(false);
          setIsExpenseModalOpen(true);
        }}
        onOpenDownloadModal={() => {
          setIsShortcutsModalOpen(false);
          setIsDownloadModalOpen(true);
        }}
        onSelectTab={(tab) => {
          setIsShortcutsModalOpen(false);
          setActiveTab(tab);
        }}
        onToggleTheme={() => toggleHighContrastDark(currentMember.id)}
      />

      {/* Connectivity status banner */}
      <OfflineIndicator />

      {/* Global Shortcut Trigger Feedback Toast */}
      <ShortcutToast toast={toast} />

      {/* Native Desktop Status Bar */}
      <DesktopStatusBar
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthGate>
      <FamilyProvider>
        <MainLayout />
      </FamilyProvider>
    </AuthGate>
  );
}

export default App;
