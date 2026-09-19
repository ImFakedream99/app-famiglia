import React from 'react';
import {
  Wallet,
  Coins,
  Receipt,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Plus,
  Check,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ActiveTab, Expense } from '../types';

export type WidgetColor = 'emerald' | 'amber' | 'indigo' | 'purple' | 'blue' | 'rose' | 'stone';

export interface DashboardWidgetSecondaryStat {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface DashboardWidgetQuickAction {
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  variant?: 'primary' | 'secondary' | 'subtle' | 'outline';
}

export interface DashboardWidgetProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: WidgetColor;
  badge?: {
    label: string;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
    icon?: React.ComponentType<{ className?: string }>;
  };
  progress?: {
    value: number; // percentage 0-100
    label?: string;
    sublabel?: string;
    barColor?: string;
  };
  secondaryStats?: DashboardWidgetSecondaryStat[];
  quickAction?: DashboardWidgetQuickAction;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  footerNote?: string;
  onClick?: () => void;
  className?: string;
}

const COLOR_MAP: Record<
  WidgetColor,
  {
    iconBg: string;
    iconText: string;
    borderHover: string;
    pillBg: string;
    pillText: string;
    progressFill: string;
  }
> = {
  emerald: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    borderHover: 'hover:border-emerald-300 dark:hover:border-emerald-700/70',
    pillBg: 'bg-emerald-100/70 dark:bg-emerald-950/60',
    pillText: 'text-emerald-800 dark:text-emerald-300',
    progressFill: 'bg-emerald-500',
  },
  amber: {
    iconBg: 'bg-amber-50 dark:bg-amber-950/50',
    iconText: 'text-amber-600 dark:text-amber-400',
    borderHover: 'hover:border-amber-300 dark:hover:border-amber-700/70',
    pillBg: 'bg-amber-100/70 dark:bg-amber-950/60',
    pillText: 'text-amber-800 dark:text-amber-300',
    progressFill: 'bg-amber-500',
  },
  indigo: {
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/50',
    iconText: 'text-indigo-600 dark:text-indigo-400',
    borderHover: 'hover:border-indigo-300 dark:hover:border-indigo-700/70',
    pillBg: 'bg-indigo-100/70 dark:bg-indigo-950/60',
    pillText: 'text-indigo-800 dark:text-indigo-300',
    progressFill: 'bg-indigo-600',
  },
  purple: {
    iconBg: 'bg-purple-50 dark:bg-purple-950/50',
    iconText: 'text-purple-600 dark:text-purple-400',
    borderHover: 'hover:border-purple-300 dark:hover:border-purple-700/70',
    pillBg: 'bg-purple-100/70 dark:bg-purple-950/60',
    pillText: 'text-purple-800 dark:text-purple-300',
    progressFill: 'bg-purple-600',
  },
  blue: {
    iconBg: 'bg-blue-50 dark:bg-blue-950/50',
    iconText: 'text-blue-600 dark:text-blue-400',
    borderHover: 'hover:border-blue-300 dark:hover:border-blue-700/70',
    pillBg: 'bg-blue-100/70 dark:bg-blue-950/60',
    pillText: 'text-blue-800 dark:text-blue-300',
    progressFill: 'bg-blue-500',
  },
  rose: {
    iconBg: 'bg-rose-50 dark:bg-rose-950/50',
    iconText: 'text-rose-600 dark:text-rose-400',
    borderHover: 'hover:border-rose-300 dark:hover:border-rose-700/70',
    pillBg: 'bg-rose-100/70 dark:bg-rose-950/60',
    pillText: 'text-rose-800 dark:text-rose-300',
    progressFill: 'bg-rose-500',
  },
  stone: {
    iconBg: 'bg-stone-100 dark:bg-zinc-800',
    iconText: 'text-stone-700 dark:text-zinc-300',
    borderHover: 'hover:border-stone-300 dark:hover:border-zinc-600',
    pillBg: 'bg-stone-100 dark:bg-zinc-800',
    pillText: 'text-stone-800 dark:text-zinc-300',
    progressFill: 'bg-stone-600',
  },
};

const BADGE_STYLES = {
  success: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
  warning: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
  danger: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
  info: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60',
  neutral: 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 border-stone-200 dark:border-zinc-700',
};

/**
 * Core reusable DashboardWidget card
 */
export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = 'indigo',
  badge,
  progress,
  secondaryStats,
  quickAction,
  secondaryAction,
  footerNote,
  onClick,
  className = '',
}) => {
  const theme = COLOR_MAP[accentColor] || COLOR_MAP.indigo;

  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-stone-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between transition-all duration-200 ${theme.borderHover} ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${className}`}
    >
      {/* Header Row: Title, Icon, Badge */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl ${theme.iconBg} ${theme.iconText} flex items-center justify-center shrink-0 shadow-2xs`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-stone-600 dark:text-zinc-400 block truncate">
                {title}
              </span>
              {badge && (
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border mt-0.5 ${
                    BADGE_STYLES[badge.variant || 'neutral']
                  }`}
                >
                  {badge.icon && <badge.icon className="w-3 h-3" />}
                  <span>{badge.label}</span>
                </span>
              )}
            </div>
          </div>

          {secondaryAction && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                secondaryAction.onClick();
              }}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors text-xs flex items-center gap-0.5 cursor-pointer"
              title={secondaryAction.label}
            >
              <span className="hidden sm:inline text-[11px] font-medium">{secondaryAction.label}</span>
              {secondaryAction.icon ? (
                <secondaryAction.icon className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Primary Value & Subtitle */}
        <div className="mt-3.5">
          <div className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-zinc-100 tracking-tight">
            {value}
          </div>
          {subtitle && (
            <div className="text-xs text-stone-600 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
              <span>{subtitle}</span>
            </div>
          )}
        </div>

        {/* Optional Progress Bar */}
        {progress && (
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-stone-600 dark:text-zinc-400">
              <span className="font-medium">{progress.label || 'Progresso'}</span>
              <span className="font-bold text-stone-900 dark:text-zinc-200">{progress.value}%</span>
            </div>
            <div className="w-full bg-stone-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progress.barColor || theme.progressFill
                }`}
                style={{ width: `${Math.min(100, Math.max(0, progress.value))}%` }}
              />
            </div>
            {progress.sublabel && (
              <span className="text-[10px] text-stone-500 dark:text-zinc-500 block">
                {progress.sublabel}
              </span>
            )}
          </div>
        )}

        {/* Optional Secondary Stats Chips/List */}
        {secondaryStats && secondaryStats.length > 0 && (
          <div className="mt-3 pt-3 border-t border-stone-100 dark:border-zinc-800/80 grid grid-cols-2 gap-2">
            {secondaryStats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-stone-50 dark:bg-zinc-800/50 p-2 rounded-xl border border-stone-100 dark:border-zinc-800 flex flex-col justify-between"
              >
                <span className="text-[10px] font-medium text-stone-500 dark:text-zinc-400 flex items-center gap-1">
                  {stat.icon && <stat.icon className="w-2.5 h-2.5" />}
                  <span className="truncate">{stat.label}</span>
                </span>
                <span className="text-xs font-bold text-stone-800 dark:text-zinc-200 mt-0.5 truncate">
                  {stat.value}
                </span>
                {stat.hint && (
                  <span className="text-[9px] text-stone-500 dark:text-zinc-500 truncate mt-0.5">
                    {stat.hint}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Quick Action Bar */}
      <div className="mt-4 pt-3 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between gap-2">
        {footerNote ? (
          <span className="text-[11px] text-stone-500 dark:text-zinc-400 truncate flex items-center gap-1">
            <Info className="w-3 h-3 text-stone-400 shrink-0" />
            <span>{footerNote}</span>
          </span>
        ) : (
          <div />
        )}

        {quickAction && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              quickAction.onClick();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs ${
              quickAction.variant === 'primary'
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : quickAction.variant === 'outline'
                ? 'bg-transparent border border-stone-300 dark:border-zinc-700 text-stone-700 dark:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800'
                : quickAction.variant === 'secondary'
                ? `${theme.pillBg} ${theme.pillText} hover:opacity-90`
                : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50'
            }`}
          >
            {quickAction.icon && <quickAction.icon className="w-3.5 h-3.5" />}
            <span>{quickAction.label}</span>
            {quickAction.shortcut && (
              <kbd className="hidden md:inline-block text-[9px] font-mono px-1 py-0.2 rounded bg-black/10 dark:bg-white/10 ml-0.5">
                {quickAction.shortcut}
              </kbd>
            )}
            {!quickAction.icon && <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Dedicated Remaining Budget Widget
 * Displays total remaining budget, remaining percentage, daily pace allowance,
 * and quick-access buttons to open budget or log an expense.
 */
export const RemainingBudgetWidget: React.FC<{
  onOpenExpenseModal?: () => void;
}> = ({ onOpenExpenseModal }) => {
  const { categories, currentMember, setActiveTab } = useFamily();

  const isParent = currentMember.role === 'parent';
  const visibleCategories = isParent
    ? categories
    : categories.filter((c) => c.isSharedWithTeens);

  const totalAllocated = visibleCategories.reduce((acc, c) => acc + c.allocated, 0);
  const totalSpent = visibleCategories.reduce((acc, c) => acc + c.spent, 0);
  const totalRemaining = Math.max(0, totalAllocated - totalSpent);
  const percentRemaining =
    totalAllocated > 0 ? Math.round((totalRemaining / totalAllocated) * 100) : 0;
  const percentSpent = 100 - percentRemaining;

  // Days left in current month for daily burn pace
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysRemaining = Math.max(1, totalDaysInMonth - currentDay);
  const dailyPace = totalRemaining / daysRemaining;

  // Over-budget categories check
  const overBudgetCats = visibleCategories.filter((c) => c.spent > c.allocated);
  const nearLimitCats = visibleCategories.filter(
    (c) => c.allocated > 0 && c.spent / c.allocated >= 0.85 && c.spent <= c.allocated
  );

  const isCritical = totalRemaining <= 0 || percentRemaining < 10;
  const isWarning = percentRemaining < 25;

  const accentColor: WidgetColor = isCritical ? 'rose' : isWarning ? 'amber' : 'emerald';

  const badgeLabel = isCritical
    ? 'Budget Esaurito'
    : isWarning
    ? 'Budget Ristretto'
    : `${percentRemaining}% Disponibile`;

  return (
    <DashboardWidget
      id="widget-remaining-budget"
      title="Budget Rimanente"
      value={formatCurrency(totalRemaining)}
      subtitle={`Su un tetto mensile complessivo di ${formatCurrency(totalAllocated)}`}
      icon={Wallet}
      accentColor={accentColor}
      badge={{
        label: badgeLabel,
        variant: isCritical ? 'danger' : isWarning ? 'warning' : 'success',
        icon: isCritical ? AlertTriangle : isWarning ? Clock : CheckCircle2,
      }}
      progress={{
        value: percentRemaining,
        label: 'Disponibilità residua',
        sublabel: `Spesi ${formatCurrency(totalSpent)} (${percentSpent}%) finora`,
        barColor: isCritical
          ? 'bg-rose-500'
          : isWarning
          ? 'bg-amber-500'
          : 'bg-emerald-500',
      }}
      secondaryStats={[
        {
          label: 'Pace Giornaliero',
          value: `~${formatCurrency(dailyPace)}/g`,
          hint: `${daysRemaining} giorni a fine mese`,
          icon: Calendar,
        },
        {
          label: 'Stato Categorie',
          value:
            overBudgetCats.length > 0
              ? `${overBudgetCats.length} sforate`
              : nearLimitCats.length > 0
              ? `${nearLimitCats.length} al limite`
              : 'Tutte regolari',
          hint: `${visibleCategories.length} categorie attive`,
          icon: overBudgetCats.length > 0 ? AlertTriangle : CheckCircle2,
        },
      ]}
      quickAction={{
        label: 'Pianifica Budget',
        onClick: () => setActiveTab('budget'),
        shortcut: 'Ctrl+B',
        variant: 'secondary',
        icon: Wallet,
      }}
      secondaryAction={
        onOpenExpenseModal
          ? {
              label: '+ Spesa',
              onClick: onOpenExpenseModal,
              icon: Plus,
            }
          : undefined
      }
      footerNote={
        overBudgetCats.length > 0
          ? `Attenzione a: ${overBudgetCats[0].name}`
          : 'Tetto di spesa aggiornato in tempo reale'
      }
    />
  );
};

/**
 * Dedicated Pending Allowance Widget
 * Displays upcoming scheduled allowance payouts, pending chore bonuses
 * waiting for approval, and pending extra fund requests.
 */
export const PendingAllowanceWidget: React.FC = () => {
  const {
    currentMember,
    members,
    allowances,
    chores,
    requests,
    setActiveTab,
    approveChore,
  } = useFamily();

  const isParent = currentMember.role === 'parent';
  const teens = members.filter((m) => m.role === 'teen');

  // Chores awaiting approval
  const pendingChores = chores.filter((c) =>
    isParent
      ? c.status === 'completed_by_teen'
      : c.teenId === currentMember.id && c.status === 'completed_by_teen'
  );
  const totalPendingChoreReward = pendingChores.reduce((acc, c) => acc + c.reward, 0);

  // Extra fund requests pending
  const pendingRequests = requests.filter((r) =>
    isParent ? r.status === 'pending' : r.teenId === currentMember.id && r.status === 'pending'
  );
  const totalPendingRequests = pendingRequests.reduce((acc, r) => acc + r.requestedAmount, 0);

  // Scheduled allowance payouts
  let scheduledAllowanceAmount = 0;
  let nextPayoutDateFormatted = '';
  let daysUntilPayout = 0;

  if (isParent) {
    // Total upcoming allowances for all teens
    scheduledAllowanceAmount = allowances.reduce((acc, a) => acc + (a.isPaused ? 0 : a.amount), 0);
    const sortedDates = allowances
      .filter((a) => !a.isPaused && a.nextPayoutDate)
      .map((a) => a.nextPayoutDate)
      .sort();
    if (sortedDates[0]) {
      nextPayoutDateFormatted = formatDate(sortedDates[0]);
      const diffTime = new Date(sortedDates[0]).getTime() - new Date().getTime();
      daysUntilPayout = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }
  } else {
    // For Teen: their own upcoming allowance
    const myConfig = allowances.find((a) => a.teenId === currentMember.id);
    scheduledAllowanceAmount = myConfig?.isPaused ? 0 : myConfig?.amount || 0;
    if (myConfig?.nextPayoutDate) {
      nextPayoutDateFormatted = formatDate(myConfig.nextPayoutDate);
      const diffTime = new Date(myConfig.nextPayoutDate).getTime() - new Date().getTime();
      daysUntilPayout = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }
  }

  // Combined total pending money (scheduled payout + chore bonus awaiting approval)
  const totalPendingPayout = scheduledAllowanceAmount + totalPendingChoreReward;

  const handleQuickApproveFirst = () => {
    if (pendingChores.length > 0) {
      approveChore(pendingChores[0].id);
    } else {
      setActiveTab('allowances');
    }
  };

  return (
    <DashboardWidget
      id="widget-pending-allowance"
      title={isParent ? 'Paghette & Erogazioni in Attesa' : 'La Tua Paghetta in Arrivo'}
      value={formatCurrency(totalPendingPayout)}
      subtitle={
        isParent
          ? `${formatCurrency(scheduledAllowanceAmount)} programmata + ${formatCurrency(
              totalPendingChoreReward
            )} faccende`
          : `Erogazione programmata di ${formatCurrency(scheduledAllowanceAmount)}`
      }
      icon={Coins}
      accentColor="amber"
      badge={{
        label:
          pendingChores.length > 0
            ? `${pendingChores.length} ${pendingChores.length === 1 ? 'faccenda da verificare' : 'faccende da verificare'}`
            : nextPayoutDateFormatted
            ? `Prossima: ${nextPayoutDateFormatted}`
            : 'Programmata',
        variant: pendingChores.length > 0 ? 'warning' : 'info',
        icon: pendingChores.length > 0 ? AlertTriangle : Clock,
      }}
      secondaryStats={[
        {
          label: isParent ? 'Prossima Erogazione' : 'Data Prevista',
          value: nextPayoutDateFormatted || 'In arrivo',
          hint: daysUntilPayout > 0 ? `Tra ${daysUntilPayout} giorni` : 'Oggi/Imminente',
          icon: Calendar,
        },
        {
          label: isParent ? 'Bonus Faccende Sospesi' : 'Guadagno Faccende',
          value: `+${formatCurrency(totalPendingChoreReward)}`,
          hint: `${pendingChores.length} compiti completati`,
          icon: Sparkles,
        },
      ]}
      quickAction={
        isParent && pendingChores.length > 0
          ? {
              label: `Approva ${pendingChores[0].title.slice(0, 14)}...`,
              onClick: handleQuickApproveFirst,
              variant: 'primary',
              icon: Check,
            }
          : {
              label: isParent ? 'Gestisci Paghette' : 'Vedi Compiti & Saldo',
              onClick: () => setActiveTab('allowances'),
              shortcut: 'Ctrl+4',
              variant: 'secondary',
              icon: Coins,
            }
      }
      secondaryAction={{
        label: 'Vedi tutte',
        onClick: () => setActiveTab('allowances'),
        icon: ChevronRight,
      }}
      footerNote={
        pendingRequests.length > 0
          ? `${pendingRequests.length} richiesta fondi extra (${formatCurrency(totalPendingRequests)}) in sospeso`
          : isParent
          ? `Paghette configurate per ${teens.length} ragazzi`
          : `Il tuo saldo attuale: ${formatCurrency(currentMember.allowanceBalance || 0)}`
      }
    />
  );
};

/**
 * DashboardWidgetGrid / Quick Summary Section
 * Groups 'Remaining Budget' and 'Pending Allowance' side-by-side or alongside companion stats
 * for lightning-fast overview access.
 */
export const DashboardWidgetGrid: React.FC<{
  onOpenExpenseModal: () => void;
}> = ({ onOpenExpenseModal }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-zinc-400">
            Accesso Rapido • Indicatori Finanziari
          </span>
          <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold px-2 py-0.5 rounded-full">
            In tempo reale
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Widget 1: Remaining Budget */}
        <RemainingBudgetWidget onOpenExpenseModal={onOpenExpenseModal} />

        {/* Widget 2: Pending Allowance */}
        <PendingAllowanceWidget />
      </div>
    </div>
  );
};
