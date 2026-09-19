import React from 'react';
import {
  Wallet,
  Coins,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Receipt,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  Check,
  ShieldCheck,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { Expense } from '../types';
import { formatCurrency, formatDate, calculateAge } from '../utils/formatters';
import {
  DashboardWidget,
  RemainingBudgetWidget,
  PendingAllowanceWidget,
} from './DashboardWidget';

interface OverviewViewProps {
  onOpenExpenseModal: () => void;
  onViewReceipt: (expense: Expense) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onOpenExpenseModal,
  onViewReceipt,
}) => {
  const {
    currentMember,
    members,
    categories,
    expenses,
    allowances,
    chores,
    requests,
    savingsGoals,
    setActiveTab,
    approveChore,
    deleteExpense,
  } = useFamily();

  // Role permissions filter for categories
  const visibleCategories =
    currentMember.role === 'parent'
      ? categories
      : categories.filter((c) => c.isSharedWithTeens);

  const totalAllocated = visibleCategories.reduce((acc, c) => acc + c.allocated, 0);
  const totalSpent = visibleCategories.reduce((acc, c) => acc + c.spent, 0);
  const totalRemaining = Math.max(0, totalAllocated - totalSpent);
  const budgetUsagePercent = totalAllocated > 0 ? Math.min(100, Math.round((totalSpent / totalAllocated) * 100)) : 0;

  // Teen allowances info
  const teens = members.filter((m) => m.role === 'teen');
  const pendingChores = chores.filter((c) => c.status === 'completed_by_teen');
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  // Savings progress
  const totalSaved = savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTargetSavings = savingsGoals.reduce((acc, g) => acc + g.targetAmount, 0);
  const savingsPercent = totalTargetSavings > 0 ? Math.round((totalSaved / totalTargetSavings) * 100) : 0;

  // Recent expenses (limit to 6)
  const visibleExpenses =
    currentMember.role === 'parent'
      ? expenses
      : expenses.filter((e) => e.scope === 'family' || e.memberId === currentMember.id);
  const recentExpenses = visibleExpenses.slice(0, 6);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  })();

  return (
    <div className="space-y-6">
      {/* Top Greeting & Header Bar (as seen in modern dashboard design) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
              Famiglia Rossi • Dashboard
            </span>
            <span className="text-[11px] bg-stone-100 text-stone-700 font-medium px-2 py-0.5 rounded-full">
              Settembre 2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1 tracking-tight">
            {greeting}, {currentMember.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            {currentMember.role === 'parent'
              ? 'Controllo completo delle finanze familiari, paghette dei ragazzi e allocazione budget.'
              : `Accesso supervisionato: saldo disponibile ${formatCurrency(currentMember.allowanceBalance || 0)}.`}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('reports')}
            className="px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 rounded-xl transition-colors"
          >
            Report Mensile
          </button>
          <button
            onClick={onOpenExpenseModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registra Spesa</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid powered by DashboardWidget */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400">
              Indicatori Finanziari Chiave
            </span>
            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/60">
              Accesso Veloce
            </span>
          </div>
          <span className="text-[11px] text-stone-500 dark:text-zinc-400 hidden sm:inline">
            Scorciatoie attive: <kbd className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 font-mono text-[10px]">Ctrl+B</kbd> Budget · <kbd className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 font-mono text-[10px]">Ctrl+4</kbd> Paghette
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Remaining Budget Widget */}
          <RemainingBudgetWidget onOpenExpenseModal={onOpenExpenseModal} />

          {/* Metric 2: Pending Allowance Widget */}
          <PendingAllowanceWidget />

          {/* Metric 3: Spese Famiglia (Mese) Widget */}
          <DashboardWidget
            id="widget-monthly-expenses"
            title="Spese Famiglia (Mese)"
            value={formatCurrency(totalSpent)}
            subtitle={`${budgetUsagePercent}% del budget totale di ${formatCurrency(totalAllocated)}`}
            icon={Receipt}
            accentColor="indigo"
            badge={{
              label: budgetUsagePercent > 90 ? 'Soglia Critica' : budgetUsagePercent > 75 ? 'Attenzione' : 'In Regola',
              variant: budgetUsagePercent > 90 ? 'danger' : budgetUsagePercent > 75 ? 'warning' : 'success',
              icon: budgetUsagePercent > 75 ? AlertTriangle : CheckCircle2,
            }}
            progress={{
              value: budgetUsagePercent,
              label: 'Utilizzo budget',
              barColor: budgetUsagePercent > 90 ? 'bg-rose-500' : budgetUsagePercent > 75 ? 'bg-amber-500' : 'bg-indigo-600',
            }}
            secondaryStats={[
              {
                label: 'Transazioni',
                value: `${visibleExpenses.length} registrate`,
                hint: currentMember.role === 'parent' ? 'Famiglia' : 'Personali',
                icon: Receipt,
              },
              {
                label: 'Media Spesa',
                value: formatCurrency(visibleExpenses.length > 0 ? totalSpent / visibleExpenses.length : 0),
                hint: 'Per scontrino',
                icon: TrendingUp,
              },
            ]}
            quickAction={{
              label: 'Nuova Spesa',
              onClick: onOpenExpenseModal,
              shortcut: 'Ctrl+E',
              variant: 'primary',
              icon: Plus,
            }}
            secondaryAction={{
              label: 'Registro',
              onClick: () => setActiveTab('expenses'),
              icon: ChevronRight,
            }}
            footerNote="Scontrini & transazioni del mese"
          />

          {/* Metric 4: Salvadanaio & Risparmi Widget */}
          <DashboardWidget
            id="widget-savings-goals"
            title="Obiettivi di Risparmio"
            value={formatCurrency(totalSaved)}
            subtitle={`Su ${formatCurrency(totalTargetSavings)} target complessivo`}
            icon={PiggyBank}
            accentColor="purple"
            badge={{
              label: `${savingsGoals.length} attivi`,
              variant: 'info',
              icon: Sparkles,
            }}
            progress={{
              value: savingsPercent,
              label: 'Avanzamento medio',
              barColor: 'bg-purple-600',
            }}
            secondaryStats={[
              {
                label: 'Mancano al Target',
                value: formatCurrency(Math.max(0, totalTargetSavings - totalSaved)),
                hint: 'Da accantonare',
                icon: TrendingDown,
              },
              {
                label: 'Top Salvadanaio',
                value: savingsGoals[0]?.title || 'Salvadanaio',
                hint: savingsGoals[0] ? `${Math.round((savingsGoals[0].currentAmount / savingsGoals[0].targetAmount) * 100)}% raccolto` : '',
                icon: PiggyBank,
              },
            ]}
            quickAction={{
              label: 'Salvadanaio',
              onClick: () => setActiveTab('savings'),
              shortcut: 'Ctrl+5',
              variant: 'secondary',
              icon: PiggyBank,
            }}
            secondaryAction={{
              label: 'Tutti',
              onClick: () => setActiveTab('savings'),
              icon: ChevronRight,
            }}
            footerNote={`${savingsPercent}% dei sogni di risparmio completati`}
          />
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Budget Categories Snapshot & Recent Expenses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Budget Categories Visualizer */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-stone-900">
                  {currentMember.role === 'parent' ? 'Ripartizione Budget Familiare' : 'Categorie Budget Condivise'}
                </h2>
                <p className="text-xs text-stone-600">
                  {currentMember.role === 'parent'
                    ? 'Stato speso vs allocato per categoria questo mese'
                    : 'Le categorie visibili e condivise dai genitori con te'}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('budget')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
              >
                <span>Gestione completa</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {visibleCategories.map((cat) => {
                const percent = cat.allocated > 0 ? Math.round((cat.spent / cat.allocated) * 100) : 0;
                const isOver = percent >= 100;
                const isWarning = percent >= 80 && !isOver;

                return (
                  <div key={cat.id} className="p-3 bg-stone-50/70 rounded-2xl border border-stone-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2 font-semibold text-stone-800">
                        <span>{cat.name}</span>
                        {isOver && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> Superato ({percent}%)
                          </span>
                        )}
                        {isWarning && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> Quasi al limite ({percent}%)
                          </span>
                        )}
                      </div>
                      <div className="text-stone-600">
                        <span className="font-bold text-stone-900">{formatCurrency(cat.spent)}</span>
                        <span className="text-stone-400"> / {formatCurrency(cat.allocated)}</span>
                      </div>
                    </div>

                    <div className="w-full bg-stone-200/80 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Table (Similar to Shipments Activities in reference image) */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-stone-900">Ultime Spese Registrate</h2>
                <p className="text-xs text-stone-600">Transazioni recenti della famiglia</p>
              </div>
              <button
                onClick={() => setActiveTab('expenses')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
              >
                <span>Tutte le spese</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Descrizione</th>
                    <th className="py-2.5 px-3">Categoria</th>
                    <th className="py-2.5 px-3">Membro</th>
                    <th className="py-2.5 px-3">Ambito</th>
                    <th className="py-2.5 px-3 text-right">Importo</th>
                    <th className="py-2.5 px-3 text-center">Scontrino</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {recentExpenses.map((exp) => {
                    const member = members.find((m) => m.id === exp.memberId);
                    return (
                      <tr key={exp.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-stone-900">{exp.note}</div>
                          <div className="text-[10px] text-stone-400">{formatDate(exp.date)}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-block px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 text-[11px] font-medium">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-5 h-5 rounded-full ${member?.avatarColor || 'bg-stone-400'} text-white text-[9px] font-bold flex items-center justify-center shrink-0`}
                            >
                              {exp.memberName.charAt(0)}
                            </div>
                            <span className="text-stone-800 font-medium truncate max-w-[90px]">
                              {exp.memberName.split(' ')[0]}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              exp.scope === 'family'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {exp.scope === 'family' ? 'Famiglia' : 'Personale'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-stone-900">
                          {formatCurrency(exp.amount)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {exp.receiptName ? (
                            <button
                              onClick={() => onViewReceipt(exp)}
                              className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Visualizza scontrino"
                            >
                              <Receipt className="w-4 h-4 inline" />
                            </button>
                          ) : (
                            <span className="text-stone-300 text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Teens Allowances, Chores Action Panel & Insights */}
        <div className="space-y-6">
          {/* Teen Allowances & Supervision Card */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-stone-900">
                  {currentMember.role === 'parent' ? 'Supervisione Figli' : 'Il Tuo Portafoglio'}
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('allowances')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Vedi tutti
              </button>
            </div>

            {/* If Teen: Personal summary card */}
            {currentMember.role === 'teen' ? (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-indigo-900 to-indigo-800 text-white rounded-2xl shadow-sm">
                  <span className="text-[11px] text-indigo-200 font-medium">Saldo Paghetta Attuale</span>
                  <div className="text-3xl font-extrabold mt-1">
                    {formatCurrency(currentMember.allowanceBalance || 0)}
                  </div>
                  <div className="mt-3 pt-3 border-t border-indigo-700/50 flex justify-between text-xs text-indigo-200">
                    <span>Paghetta: 25,00 € / sett.</span>
                    <span className="text-emerald-300 font-medium">+20% al salvadanaio</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="flex-1 py-2 text-xs font-semibold text-center rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 transition-colors"
                  >
                    Chiedi Fondi Extra
                  </button>
                  <button
                    onClick={() => setActiveTab('savings')}
                    className="flex-1 py-2 text-xs font-semibold text-center rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
                  >
                    Metti nel Salvadanaio
                  </button>
                </div>
              </div>
            ) : (
              /* If Parent: Teen cards */
              <div className="space-y-3">
                {teens.map((teen) => {
                  const cfg = allowances.find((a) => a.teenId === teen.id);
                  const age = calculateAge(teen.birthDate);
                  return (
                    <div
                      key={teen.id}
                      className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/70"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-xl ${teen.avatarColor} text-white font-bold text-xs flex items-center justify-center`}
                          >
                            {teen.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-stone-900">
                              {teen.name} ({age}a)
                            </div>
                            <div className="text-[10px] text-stone-500">
                              Paghetta: {formatCurrency(cfg?.amount || 0)} ({cfg?.frequency === 'weekly' ? 'settimanale' : 'mensile'})
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-extrabold text-stone-900">
                            {formatCurrency(teen.allowanceBalance || 0)}
                          </div>
                          <div className="text-[9px] text-stone-600 font-medium">saldo attuale</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-[11px] text-stone-600">
                        <span>Prossima erogazione:</span>
                        <span className="font-semibold text-stone-800">
                          {cfg?.nextPayoutDate ? formatDate(cfg.nextPayoutDate) : 'Programmata'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Chores & Task Approvals */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-stone-900">
                  {currentMember.role === 'parent' ? 'Faccende da Approvare' : 'Le Tue Faccende Attive'}
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('allowances')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Vedi compiti
              </button>
            </div>

            {currentMember.role === 'parent' ? (
              pendingChores.length === 0 ? (
                <p className="text-xs text-stone-600 text-center py-4 bg-stone-50 rounded-2xl">
                  Nessuna faccenda in attesa di approvazione.
                </p>
              ) : (
                <div className="space-y-2">
                  {pendingChores.map((chore) => {
                    const teen = members.find((m) => m.id === chore.teenId);
                    return (
                      <div
                        key={chore.id}
                        className="p-3 bg-indigo-50/40 rounded-2xl border border-indigo-100/80 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-900 truncate">{chore.title}</p>
                          <p className="text-[10px] text-stone-500">
                            Completata da <span className="font-semibold text-stone-700">{teen?.name}</span> (+{formatCurrency(chore.reward)})
                          </p>
                        </div>
                        <button
                          onClick={() => approveChore(chore.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shrink-0 flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approva</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* For Teen: active chores list */
              <div className="space-y-2">
                {chores
                  .filter((c) => c.teenId === currentMember.id && c.status === 'pending')
                  .slice(0, 3)
                  .map((chore) => (
                    <div
                      key={chore.id}
                      className="p-3 bg-stone-50 rounded-2xl border border-stone-200/60 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate">{chore.title}</p>
                        <span className="text-[10px] text-emerald-700 font-semibold">
                          +{formatCurrency(chore.reward)}
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveTab('allowances')}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Completa
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Pending Extra Fund Requests (if any) */}
          {currentMember.role === 'parent' && pendingRequests.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  {pendingRequests.length} Richiesta Fondi Extra in Sospeso
                </span>
                <button
                  onClick={() => setActiveTab('requests')}
                  className="text-xs font-bold text-amber-800 underline"
                >
                  Esamina
                </button>
              </div>
              <p className="text-xs text-amber-800">
                {pendingRequests[0].teenName} ha richiesto {formatCurrency(pendingRequests[0].requestedAmount)} per "{pendingRequests[0].reason}".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
