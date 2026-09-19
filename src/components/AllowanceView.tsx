import React, { useState } from 'react';
import {
  Coins,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Play,
  Pause,
  Edit2,
  Check,
  X,
  Sparkles,
  ArrowDownRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { AllowanceConfig, Chore } from '../types';
import { formatCurrency, formatDate, formatDateTime, calculateAge } from '../utils/formatters';

export const AllowanceView: React.FC = () => {
  const {
    currentMember,
    members,
    allowances,
    allowanceRecords,
    chores,
    updateAllowanceConfig,
    triggerAllowancePayout,
    addChore,
    markChoreCompleted,
    approveChore,
    rejectChore,
  } = useFamily();

  const isParent = currentMember.role === 'parent';
  const teens = members.filter((m) => m.role === 'teen');

  // Selected teen tab for detailed view
  const [selectedTeenId, setSelectedTeenId] = useState<string>(
    !isParent && currentMember.role === 'teen' ? currentMember.id : teens[0]?.id || 'm3'
  );

  // Edit config modal
  const [editingConfig, setEditingConfig] = useState<AllowanceConfig | null>(null);
  const [cfgAmount, setCfgAmount] = useState('');
  const [cfgFreq, setCfgFreq] = useState<'weekly' | 'monthly'>('weekly');
  const [cfgAutoSave, setCfgAutoSave] = useState('15');

  // New chore modal
  const [isNewChoreModalOpen, setIsNewChoreModalOpen] = useState(false);
  const [choreTitle, setChoreTitle] = useState('');
  const [choreDesc, setChoreDesc] = useState('');
  const [choreReward, setChoreReward] = useState('3.00');
  const [choreFreq, setChoreFreq] = useState<'daily' | 'weekly' | 'one-time'>('weekly');

  const activeTeen = members.find((m) => m.id === selectedTeenId) || teens[0];
  const activeConfig = allowances.find((a) => a.teenId === selectedTeenId);
  const activeRecords = allowanceRecords.filter((r) => r.teenId === selectedTeenId);
  const activeChores = chores.filter((c) => c.teenId === selectedTeenId);

  const handleEditConfig = (cfg: AllowanceConfig) => {
    setEditingConfig(cfg);
    setCfgAmount(cfg.amount.toString());
    setCfgFreq(cfg.frequency);
    setCfgAutoSave(cfg.autoSavePercentage.toString());
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConfig) return;
    const amount = parseFloat(cfgAmount.replace(',', '.'));
    const autoSave = parseInt(cfgAutoSave, 10);
    if (isNaN(amount) || amount <= 0) return;

    updateAllowanceConfig({
      ...editingConfig,
      amount,
      frequency: cfgFreq,
      autoSavePercentage: isNaN(autoSave) ? 0 : autoSave,
    });
    setEditingConfig(null);
  };

  const handleCreateChore = (e: React.FormEvent) => {
    e.preventDefault();
    const reward = parseFloat(choreReward.replace(',', '.'));
    if (!choreTitle.trim() || isNaN(reward) || reward < 0) return;

    addChore({
      teenId: selectedTeenId,
      title: choreTitle.trim(),
      description: choreDesc.trim() || undefined,
      reward,
      frequency: choreFreq,
    });

    setChoreTitle('');
    setChoreDesc('');
    setChoreReward('3.00');
    setIsNewChoreModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Gestione Paghette & Faccende
            </span>
            <span className="text-[11px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-200/60">
              Educazione Finanziaria Attiva
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 mt-1">
            {isParent ? 'Paghette e Responsabilità' : 'La Tua Paghetta & Compiti'}
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            {isParent
              ? 'Configura erogazioni automatiche, collega bonus alle faccende domestiche e approva le ricompense.'
              : 'Monitora la tua paghetta, completa le faccende per guadagnare bonus e impara a gestire il tuo denaro.'}
          </p>
        </div>

        {/* Teen Switcher tabs if multiple teens exist */}
        {teens.length > 1 && (
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl self-start md:self-center">
            {teens.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTeenId(t.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  selectedTeenId === t.id
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t.name.split(' ')[0]} ({calculateAge(t.birthDate)}a)
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Overview Cards for Active Teen */}
      {activeTeen && activeConfig && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Balance & Status */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-600">Saldo Disponibile</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-stone-900">
                {formatCurrency(activeTeen.allowanceBalance || 0)}
              </div>
              <p className="text-[11px] text-stone-600 mt-0.5">
                Spese personali tracciabili registrate da {activeTeen.name.split(' ')[0]}
              </p>
            </div>
            {isParent && (
              <div className="flex gap-2 pt-2 border-t border-stone-100">
                <button
                  onClick={() => triggerAllowancePayout(activeTeen.id, 'Erogazione manuale straordinaria')}
                  className="flex-1 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors text-center"
                >
                  Eroga Ora (Anticipo)
                </button>
              </div>
            )}
          </div>

          {/* Card 2: Recurring Payout Schedule */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-600">Erogazione Ricorrente</span>
              {isParent && (
                <button
                  onClick={() => handleEditConfig(activeConfig)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                  title="Configura paghetta"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="my-3">
              <div className="text-2xl font-extrabold text-stone-900">
                {formatCurrency(activeConfig.amount)}
              </div>
              <p className="text-[11px] text-stone-600 mt-0.5">
                Frequenza:{' '}
                <strong className="text-stone-800">
                  {activeConfig.frequency === 'weekly' ? 'Settimanale' : 'Mensile'}
                </strong>
                {activeConfig.isPaused && (
                  <span className="ml-1.5 text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-bold">
                    Sospesa
                  </span>
                )}
              </p>
            </div>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
              <span>Prossima erogazione:</span>
              <span className="font-bold text-stone-800">{formatDate(activeConfig.nextPayoutDate)}</span>
            </div>
          </div>

          {/* Card 3: Auto-Save Rule */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-600">Accantonamento Risparmi</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="my-3">
              <div className="text-2xl font-extrabold text-purple-700">
                {activeConfig.autoSavePercentage}%
              </div>
              <p className="text-[11px] text-stone-600 mt-0.5">
                Accreditato in automatico nel salvadanaio a ogni erogazione (
                {formatCurrency((activeConfig.amount * activeConfig.autoSavePercentage) / 100)})
              </p>
            </div>
            <div className="pt-2 border-t border-stone-100 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Abitudine virtuosa attiva</span>
            </div>
          </div>
        </div>
      )}

      {/* Chores & Domestic Tasks Section (PRD 6.3) */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Compiti & Faccende con Ricompensa
            </h2>
            <p className="text-xs text-stone-600">
              Attività domestiche per incoraggiare la collaborazione familiare e guadagnare bonus extra sulla paghetta.
            </p>
          </div>

          {isParent && (
            <button
              onClick={() => setIsNewChoreModalOpen(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-center"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuova Faccenda</span>
            </button>
          )}
        </div>

        {/* Chores List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          {activeChores.length === 0 ? (
            <div className="col-span-2 py-8 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl">
              Nessun compito attivo configurato per {activeTeen?.name}.
            </div>
          ) : (
            activeChores.map((chore) => {
              const isCompleted = chore.status === 'completed_by_teen';
              const isPaid = chore.status === 'approved_and_paid';

              return (
                <div
                  key={chore.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isPaid
                      ? 'bg-stone-50/60 border-stone-200/60 opacity-80'
                      : isCompleted
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-white border-stone-200/80 hover:border-stone-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-sm font-bold text-stone-900">{chore.title}</h3>
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg shrink-0">
                        +{formatCurrency(chore.reward)}
                      </span>
                    </div>

                    {chore.description && (
                      <p className="text-xs text-stone-500 mb-2">{chore.description}</p>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-stone-400">
                      <span className="capitalize">{chore.frequency}</span>
                      <span>•</span>
                      {isPaid && (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Approvato & Accreditato
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-amber-700 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Fatto dal ragazzo • In attesa genitore
                        </span>
                      )}
                      {!isPaid && !isCompleted && <span>Da completare</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    {/* Teen action */}
                    {!isParent && currentMember.id === chore.teenId && (
                      <div>
                        {chore.status === 'pending' ? (
                          <button
                            onClick={() => markChoreCompleted(chore.id)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Segna come Fatto</span>
                          </button>
                        ) : chore.status === 'completed_by_teen' ? (
                          <span className="text-xs text-amber-700 font-semibold">
                            In attesa di verifica genitore...
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-700 font-semibold">
                            Bonus già riscosso!
                          </span>
                        )}
                      </div>
                    )}

                    {/* Parent action */}
                    {isParent && (
                      <div className="w-full flex items-center justify-between">
                        {chore.status === 'completed_by_teen' ? (
                          <div className="flex items-center gap-2 w-full justify-between">
                            <span className="text-xs text-stone-600 font-medium">
                              Completata: vuoi approvare il bonus?
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => rejectChore(chore.id)}
                                className="px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
                              >
                                Rifai
                              </button>
                              <button
                                onClick={() => approveChore(chore.id)}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approva (+{formatCurrency(chore.reward)})</span>
                              </button>
                            </div>
                          </div>
                        ) : chore.status === 'approved_and_paid' ? (
                          <span className="text-xs text-stone-500">
                            Bonus pagato il {chore.approvedAt ? formatDate(chore.approvedAt) : ''}
                          </span>
                        ) : (
                          <span className="text-xs text-stone-400">
                            Non ancora completata dal ragazzo
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Allowance Payouts History Table (PRD 6.3) */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
        <div className="mb-4">
          <h2 className="text-base font-bold text-stone-900">
            Storico Erogazioni & Accrediti per {activeTeen?.name}
          </h2>
          <p className="text-xs text-stone-600">Tracciabilità completa di paghette ordinarie e bonus versati.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead>
              <tr className="border-b border-stone-100 text-stone-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3">Tipologia</th>
                <th className="py-2.5 px-3">Causale / Dettagli</th>
                <th className="py-2.5 px-3 text-right">Importo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {activeRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-stone-400">
                    Nessuna erogazione registrata finora.
                  </td>
                </tr>
              ) : (
                activeRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-stone-50/70">
                    <td className="py-3 px-3 font-medium text-stone-500 whitespace-nowrap">
                      {formatDateTime(rec.date)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rec.type === 'regular'
                            ? 'bg-amber-50 text-amber-800'
                            : rec.type === 'chore_bonus'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-indigo-50 text-indigo-800'
                        }`}
                      >
                        {rec.type === 'regular'
                          ? 'Paghetta Ordinaria'
                          : rec.type === 'chore_bonus'
                          ? 'Bonus Compiti'
                          : 'Fondo Extra'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-stone-800">{rec.note}</td>
                    <td className="py-3 px-3 text-right font-extrabold text-emerald-700 text-sm whitespace-nowrap">
                      +{formatCurrency(rec.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Allowance Config Modal */}
      {editingConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-1">
              Configura Paghetta: {activeTeen?.name}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Imposta importo, frequenza e percentuale di risparmio automatico.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Importo (€) *
                </label>
                <input
                  type="text"
                  value={cfgAmount}
                  onChange={(e) => setCfgAmount(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-base font-bold text-stone-900"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Frequenza
                </label>
                <select
                  value={cfgFreq}
                  onChange={(e) => setCfgFreq(e.target.value as 'weekly' | 'monthly')}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                >
                  <option value="weekly">Settimanale</option>
                  <option value="monthly">Mensile</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Accantonamento Salvadanaio Automatico (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={cfgAutoSave}
                  onChange={(e) => setCfgAutoSave(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                />
                <span className="text-[11px] text-stone-500 mt-0.5 block">
                  Questa percentuale verrà direttamente destinata all'obiettivo di risparmio del ragazzo.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingConfig(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Salva Configurazione
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Chore Modal */}
      {isNewChoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-1">Nuovo Compito / Faccenda</h3>
            <p className="text-xs text-stone-500 mb-4">
              Assegna un'attività a {activeTeen?.name} con ricompensa.
            </p>

            <form onSubmit={handleCreateChore} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Titolo Faccenda *
                </label>
                <input
                  type="text"
                  placeholder="es. Lavare i piatti, Riordinare cantina..."
                  value={choreTitle}
                  onChange={(e) => setChoreTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Descrizione (Opzionale)
                </label>
                <input
                  type="text"
                  placeholder="Cosa deve fare nello specifico..."
                  value={choreDesc}
                  onChange={(e) => setChoreDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Ricompensa (€) *
                  </label>
                  <input
                    type="text"
                    value={choreReward}
                    onChange={(e) => setChoreReward(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Ricorrenza
                  </label>
                  <select
                    value={choreFreq}
                    onChange={(e) => setChoreFreq(e.target.value as 'daily' | 'weekly' | 'one-time')}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                  >
                    <option value="weekly">Settimanale</option>
                    <option value="daily">Giornaliera</option>
                    <option value="one-time">Una Tantum</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewChoreModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Assegna Compito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
