import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Eye,
  Calendar,
  Sparkles,
  Edit2,
  ChevronRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { BudgetCategory, SpecialBudget } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

export const BudgetView: React.FC = () => {
  const {
    currentMember,
    categories,
    specialBudgets,
    updateCategoryBudget,
    addCategory,
    addSpecialBudget,
  } = useFamily();

  // Modals state
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [newAllocated, setNewAllocated] = useState<string>('');
  const [isShared, setIsShared] = useState<boolean>(true);

  const [isNewCatModalOpen, setIsNewCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatBudget, setNewCatBudget] = useState('');
  const [newCatShared, setNewCatShared] = useState(true);

  const [isNewSpecialModalOpen, setIsNewSpecialModalOpen] = useState(false);
  const [specialTitle, setSpecialTitle] = useState('');
  const [specialAmount, setSpecialAmount] = useState('');
  const [specialStart, setSpecialStart] = useState('');
  const [specialEnd, setSpecialEnd] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  // Role visibility
  const isParent = currentMember.role === 'parent';
  const visibleCategories = isParent ? categories : categories.filter((c) => c.isSharedWithTeens);

  const totalAllocated = visibleCategories.reduce((a, c) => a + c.allocated, 0);
  const totalSpent = visibleCategories.reduce((a, c) => a + c.spent, 0);
  const totalRemaining = Math.max(0, totalAllocated - totalSpent);
  const percentUsed = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  const handleEditClick = (cat: BudgetCategory) => {
    if (!isParent) return;
    setEditingCategory(cat);
    setNewAllocated(cat.allocated.toString());
    setIsShared(cat.isSharedWithTeens);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const amount = parseFloat(newAllocated.replace(',', '.'));
    if (isNaN(amount) || amount < 0) return;
    updateCategoryBudget(editingCategory.id, amount, isShared);
    setEditingCategory(null);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newCatBudget.replace(',', '.'));
    if (!newCatName.trim() || isNaN(amount) || amount <= 0) return;
    addCategory({
      name: newCatName.trim(),
      icon: 'Tag',
      allocated: amount,
      isSharedWithTeens: newCatShared,
      color: 'indigo',
    });
    setNewCatName('');
    setNewCatBudget('');
    setIsNewCatModalOpen(false);
  };

  const handleCreateSpecialBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(specialAmount.replace(',', '.'));
    if (!specialTitle.trim() || isNaN(amount) || amount <= 0) return;
    addSpecialBudget({
      title: specialTitle.trim(),
      targetAmount: amount,
      startDate: specialStart || '2026-06-01',
      endDate: specialEnd || '2026-08-31',
      notes: specialNotes.trim(),
    });
    setSpecialTitle('');
    setSpecialAmount('');
    setSpecialStart('');
    setSpecialEnd('');
    setSpecialNotes('');
    setIsNewSpecialModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Pianificazione Finanziaria
            </span>
            <span className="text-[11px] bg-stone-100 text-stone-700 font-medium px-2 py-0.5 rounded-full">
              Mese Corrente
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 mt-1">Budget Familiare</h1>
          <p className="text-xs text-stone-600 mt-0.5">
            {isParent
              ? 'Definisci i tetti di spesa mensili per categoria e imposta eventi speciali una tantum.'
              : 'Visualizzazione del budget familiare per le categorie condivise con i ragazzi.'}
          </p>
        </div>

        {isParent && (
          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={() => setIsNewSpecialModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Budget Una Tantum</span>
            </button>
            <button
              onClick={() => setIsNewCatModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuova Categoria</span>
            </button>
          </div>
        )}
      </div>

      {/* Aggregate Budget Bar Card */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <span className="text-xs font-medium text-stone-600">Totale Budget Mensile Allocato</span>
            <div className="text-3xl font-extrabold text-stone-900 mt-0.5">
              {formatCurrency(totalSpent)}{' '}
              <span className="text-sm font-medium text-stone-600">
                / {formatCurrency(totalAllocated)}
              </span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs font-medium text-stone-600">Disponibilità Rimanente</span>
            <div
              className={`text-xl font-bold ${
                totalRemaining < totalAllocated * 0.1 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {formatCurrency(totalRemaining)}
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-stone-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-stone-200/60">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              percentUsed > 100
                ? 'bg-rose-500'
                : percentUsed > 80
                ? 'bg-amber-500'
                : 'bg-indigo-600'
            }`}
            style={{ width: `${Math.min(100, percentUsed)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-stone-600 mt-2 font-medium">
          <span>{percentUsed}% utilizzato</span>
          <span>{100 - Math.min(100, percentUsed)}% rimanente</span>
        </div>
      </div>

      {/* Categories Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-stone-900">Categorie di Spesa Mensili</h2>
          {!isParent && (
            <span className="text-xs text-stone-500 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              Categorie condivise dai genitori
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleCategories.map((cat) => {
            const percent = cat.allocated > 0 ? Math.round((cat.spent / cat.allocated) * 100) : 0;
            const isOver = percent >= 100;
            const isWarning = percent >= 80 && !isOver;
            const remaining = Math.max(0, cat.allocated - cat.spent);

            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between hover:border-stone-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-stone-900 truncate">{cat.name}</h3>
                        {!cat.isSharedWithTeens && isParent && (
                          <span title="Solo Genitori" className="text-stone-400">
                            <Lock className="w-3 h-3 inline" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-600">
                        {isOver ? 'Budget superato' : `${formatCurrency(remaining)} rimasti`}
                      </span>
                    </div>

                    {isParent && (
                      <button
                        onClick={() => handleEditClick(cat)}
                        className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                        title="Modifica limite budget"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Amounts */}
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xl font-extrabold text-stone-900">
                      {formatCurrency(cat.spent)}
                    </span>
                    <span className="text-xs text-stone-600 font-medium">
                      di {formatCurrency(cat.allocated)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </div>

                {/* Status footer pill */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-stone-600">{percent}% raggiunto</span>
                  {isOver && (
                    <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Superato
                    </span>
                  )}
                  {isWarning && (
                    <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> &gt;80%
                    </span>
                  )}
                  {!isOver && !isWarning && (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> In regola
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Special Budgets (Una tantum) Section (PRD 6.1) */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-stone-900">Budget Eventi "Una Tantum"</h2>
            <p className="text-xs text-stone-600">
              Spese straordinarie per vacanze, gite scolastiche o progetti con plafond dedicato.
            </p>
          </div>
          {isParent && (
            <button
              onClick={() => setIsNewSpecialModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Aggiungi evento</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {specialBudgets.map((sb) => {
            const percent = sb.targetAmount > 0 ? Math.round((sb.currentSpent / sb.targetAmount) * 100) : 0;
            const remaining = Math.max(0, sb.targetAmount - sb.currentSpent);

            return (
              <div
                key={sb.id}
                className="p-5 bg-stone-50/80 rounded-2xl border border-stone-200/70 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-stone-900">{sb.title}</h3>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                      Una Tantum
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mb-3">{sb.notes}</p>

                  <div className="flex items-baseline justify-between mb-1.5 text-xs">
                    <span className="font-extrabold text-stone-900 text-lg">
                      {formatCurrency(sb.currentSpent)}
                    </span>
                    <span className="text-stone-600">
                      Target: {formatCurrency(sb.targetAmount)} (rimasti {formatCurrency(remaining)})
                    </span>
                  </div>

                  <div className="w-full bg-stone-200/80 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>
                      {formatDate(sb.startDate)} - {formatDate(sb.endDate)}
                    </span>
                  </div>
                  <span className="font-bold text-stone-700">{percent}% completato</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-1">
              Modifica Budget: {editingCategory.name}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Imposta il tetto mensile e la visibilità per i figli.
            </p>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Budget Mensile (€)
                </label>
                <input
                  type="text"
                  value={newAllocated}
                  onChange={(e) => setNewAllocated(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-base font-bold text-stone-900 focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200/60">
                <div className="text-xs">
                  <span className="font-semibold text-stone-800 block">Condividi con i ragazzi</span>
                  <span className="text-stone-500 text-[11px]">
                    Visibile nel report parziale dei figli
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isShared}
                  onChange={(e) => setIsShared(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Salva Modifiche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Category Modal */}
      {isNewCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-1">Nuova Categoria Budget</h3>
            <p className="text-xs text-stone-500 mb-4">Crea una nuova voce di spesa ricorrente.</p>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome Categoria *
                </label>
                <input
                  type="text"
                  placeholder="es. Libri & Corsi, Animali domestici..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Budget Mensile (€) *
                </label>
                <input
                  type="text"
                  placeholder="150"
                  value={newCatBudget}
                  onChange={(e) => setNewCatBudget(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200/60">
                <div className="text-xs">
                  <span className="font-semibold text-stone-800 block">Condividi con i ragazzi</span>
                  <span className="text-stone-500 text-[11px]">Visibile ai figli</span>
                </div>
                <input
                  type="checkbox"
                  checked={newCatShared}
                  onChange={(e) => setNewCatShared(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewCatModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Crea Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Special Budget Modal */}
      {isNewSpecialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-1">Nuovo Budget Una Tantum</h3>
            <p className="text-xs text-stone-500 mb-4">
              Pianifica un budget separato per una vacanza, gita o evento straordinario.
            </p>

            <form onSubmit={handleCreateSpecialBudget} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Titolo Evento *
                </label>
                <input
                  type="text"
                  placeholder="es. Gita Scolastica Praga, Vacanza Montagna..."
                  value={specialTitle}
                  onChange={(e) => setSpecialTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Budget Previsto (€) *
                </label>
                <input
                  type="text"
                  placeholder="500"
                  value={specialAmount}
                  onChange={(e) => setSpecialAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Data Inizio</label>
                  <input
                    type="date"
                    value={specialStart}
                    onChange={(e) => setSpecialStart(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Data Fine</label>
                  <input
                    type="date"
                    value={specialEnd}
                    onChange={(e) => setSpecialEnd(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Note & Dettagli</label>
                <textarea
                  rows={2}
                  placeholder="Dettagli sulle voci incluse (trasporti, alloggio, pasti...)"
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewSpecialModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Crea Budget Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
