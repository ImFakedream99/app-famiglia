import React, { useState } from 'react';
import {
  PiggyBank,
  Plus,
  Calendar,
  Sparkles,
  Gift,
  CheckCircle2,
  Trophy,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFamily } from '../context/FamilyContext';
import { SavingsGoal } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

export const SavingsView: React.FC = () => {
  const {
    currentMember,
    members,
    savingsGoals,
    addSavingsGoal,
    contributeToGoal,
  } = useFamily();

  const isParent = currentMember.role === 'parent';

  // Deposit modal state
  const [depositingGoal, setDepositingGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositError, setDepositError] = useState('');

  // New goal modal state
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalMemberId, setGoalMemberId] = useState(currentMember.id);
  const [goalAutoPercent, setGoalAutoPercent] = useState('20');

  // Filter goals: Parent sees all; Teen sees their own and shared family goals
  const visibleGoals = isParent
    ? savingsGoals
    : savingsGoals.filter((g) => g.memberId === currentMember.id || g.memberId === 'm1');

  const totalSaved = visibleGoals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTarget = visibleGoals.reduce((acc, g) => acc + g.targetAmount, 0);

  const handleOpenDeposit = (goal: SavingsGoal) => {
    setDepositingGoal(goal);
    setDepositAmount('10.00');
    setDepositError('');
  };

  const handleConfirmDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositingGoal) return;

    const amount = parseFloat(depositAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      setDepositError('Inserisci un importo valido.');
      return;
    }

    // If teen depositing to own goal, verify balance
    if (!isParent && currentMember.role === 'teen' && currentMember.id === depositingGoal.memberId) {
      const balance = currentMember.allowanceBalance || 0;
      if (amount > balance) {
        setDepositError(`Saldo insufficiente (${formatCurrency(balance)} disponibili).`);
        return;
      }
    }

    const wasCompletedBefore = depositingGoal.currentAmount >= depositingGoal.targetAmount;
    contributeToGoal(depositingGoal.id, amount);

    // Trigger confetti if this deposit completes the goal!
    if (!wasCompletedBefore && (depositingGoal.currentAmount + amount) >= depositingGoal.targetAmount) {
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.log('Confetti trigger', err);
      }
    }

    setDepositingGoal(null);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(goalTarget.replace(',', '.'));
    if (!goalTitle.trim() || isNaN(target) || target <= 0) return;

    addSavingsGoal({
      title: goalTitle.trim(),
      targetAmount: target,
      memberId: goalMemberId,
      deadline: goalDeadline || undefined,
      icon: 'PiggyBank',
      color: 'purple',
      autoAllocatePercentage: parseInt(goalAutoPercent, 10) || 0,
    });

    setGoalTitle('');
    setGoalTarget('');
    setGoalDeadline('');
    setIsNewGoalModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Salvadanaio & Obiettivi
            </span>
            <span className="text-[11px] bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full border border-purple-200/60">
              Risparmio Attivo
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 mt-1">Obiettivi di Risparmio</h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Imposta traguardi concreti per acquisti importanti e impara il valore dell'accantonamento costante.
          </p>
        </div>

        <button
          onClick={() => setIsNewGoalModalOpen(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-center"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nuovo Obiettivo</span>
        </button>
      </div>

      {/* Aggregate Savings Summary Card */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-xs font-medium text-stone-600">Totale Risparmi Accumulati</span>
            <div className="text-3xl font-extrabold text-stone-900 mt-0.5">
              {formatCurrency(totalSaved)}{' '}
              <span className="text-sm font-medium text-stone-600">
                / {formatCurrency(totalTarget)}
              </span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs font-medium text-stone-600">Completamento Complessivo</span>
            <div className="text-xl font-bold text-purple-700">
              {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%
            </div>
          </div>
        </div>

        <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden p-0.5 border border-stone-200/60">
          <div
            className="h-full rounded-full bg-purple-600 transition-all duration-700"
            style={{
              width: `${totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleGoals.map((goal) => {
          const owner = members.find((m) => m.id === goal.memberId);
          const percent = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
          const isFinished = percent >= 100;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                isFinished
                  ? 'border-emerald-200 bg-emerald-50/20 shadow-xs ring-1 ring-emerald-300'
                  : 'border-stone-200/80 hover:border-stone-300'
              }`}
            >
              <div>
                {/* Header & Owner info */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className={`w-5 h-5 rounded-full ${owner?.avatarColor || 'bg-stone-400'} text-white font-bold text-[9px] flex items-center justify-center shrink-0`}
                      >
                        {owner?.name.charAt(0)}
                      </div>
                      <span className="text-[11px] font-semibold text-stone-600 truncate">
                        {owner?.name}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-stone-900 leading-tight">
                      {goal.title}
                    </h3>
                  </div>

                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    {isFinished ? <Trophy className="w-5 h-5 text-amber-500" /> : <PiggyBank className="w-5 h-5" />}
                  </div>
                </div>

                {/* Progress bar and values */}
                <div className="my-4">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-2xl font-extrabold text-stone-900">
                      {formatCurrency(goal.currentAmount)}
                    </span>
                    <span className="text-xs text-stone-600 font-medium">
                      di {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>

                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isFinished ? 'bg-emerald-500' : 'bg-purple-600'
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-600 mt-2">
                    <span className="font-semibold text-stone-800">{percent}% raggiunto</span>
                    <span>{isFinished ? 'Completato!' : `Mancano ${formatCurrency(remaining)}`}</span>
                  </div>
                </div>

                {/* Metadata & Deadline */}
                <div className="space-y-1 text-xs text-stone-600 pt-2 border-t border-stone-100">
                  {goal.deadline && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>Traguardo: {formatDate(goal.deadline)}</span>
                    </div>
                  )}
                  {goal.autoAllocatePercentage ? (
                    <div className="flex items-center gap-1.5 text-purple-700 font-medium">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{goal.autoAllocatePercentage}% paghetta accantonato in automatico</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                {isFinished ? (
                  <div className="w-full text-center py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Traguardo raggiunto! Congratulazioni!</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenDeposit(goal)}
                    className="w-full py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    {isParent && goal.memberId !== currentMember.id ? (
                      <>
                        <Gift className="w-3.5 h-3.5" />
                        <span>Regala Contributo / Bonus</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Versa Risparmi</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deposit Modal */}
      {depositingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-1">
              Versa Risparmi in: {depositingGoal.title}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              {isParent && depositingGoal.memberId !== currentMember.id
                ? 'Stai facendo un regalo / bonus educativo al figlio per questo obiettivo.'
                : `Verrà prelevato dal tuo saldo paghetta (${formatCurrency(currentMember.allowanceBalance || 0)} disponibili).`}
            </p>

            <form onSubmit={handleConfirmDeposit} className="space-y-4">
              {depositError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                  {depositError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Importo da Versare (€) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-medium">
                    €
                  </span>
                  <input
                    type="text"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-lg font-bold text-stone-900"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositingGoal(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Conferma Versamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Goal Modal */}
      {isNewGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-1">Nuovo Obiettivo di Risparmio</h3>
            <p className="text-xs text-stone-500 mb-4">
              Crea un salvadanaio per un acquisto o progetto futuro.
            </p>

            <form onSubmit={handleCreateGoal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Cosa desideri comprare o risparmiare? *
                </label>
                <input
                  type="text"
                  placeholder="es. Bicicletta nuova, Corso di chitarra, Cuffie..."
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Importo Target (€) *
                </label>
                <input
                  type="text"
                  placeholder="100.00"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900"
                />
              </div>

              {isParent && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Titolare dell'Obiettivo
                  </label>
                  <select
                    value={goalMemberId}
                    onChange={(e) => setGoalMemberId(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role === 'parent' ? 'Genitore' : 'Figlio'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Scadenza Prevista
                  </label>
                  <input
                    type="date"
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Accantonamento Paghetta (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={goalAutoPercent}
                    onChange={(e) => setGoalAutoPercent(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewGoalModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Crea Obiettivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
