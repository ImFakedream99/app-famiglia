import React, { useState, useEffect } from 'react';
import { X, Sparkles, Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { suggestCategoryFromNote } from '../utils/formatters';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose }) => {
  const { currentMember, members, categories, addExpense } = useFamily();

  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [category, setCategory] = useState<string>(categories[0]?.name || 'Spesa Alimentare');
  const [scope, setScope] = useState<'family' | 'personal'>(
    currentMember.role === 'teen' ? 'personal' : 'family'
  );
  const [memberId, setMemberId] = useState<string>(currentMember.id);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptName, setReceiptName] = useState<string>('');
  const [suggestedCat, setSuggestedCat] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setNote('');
      setCategory(categories[0]?.name || 'Spesa Alimentare');
      setScope(currentMember.role === 'teen' ? 'personal' : 'family');
      setMemberId(currentMember.id);
      setReceiptFile(null);
      setReceiptName('');
      setSuggestedCat(null);
      setError('');
    }
  }, [isOpen, currentMember, categories]);

  // Real-time category suggestion when user types note
  const handleNoteChange = (text: string) => {
    setNote(text);
    const suggestion = suggestCategoryFromNote(text);
    if (suggestion) {
      setSuggestedCat(suggestion);
      // Automatically apply if category exists in list
      if (categories.some((c) => c.name === suggestion)) {
        setCategory(suggestion);
      }
    } else {
      setSuggestedCat(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      setReceiptName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Inserisci un importo valido superiore a 0');
      return;
    }
    if (!note.trim()) {
      setError('Inserisci una breve descrizione o nota della spesa');
      return;
    }

    // If teen personal expense, verify balance
    const actingMember = members.find((m) => m.id === memberId) || currentMember;
    if (actingMember.role === 'teen' && scope === 'personal') {
      const available = actingMember.allowanceBalance || 0;
      if (parsedAmount > available) {
        setError(
          `Saldo paghetta insufficiente (${available.toFixed(2)} € disponibili su ${parsedAmount.toFixed(2)} € richiesti). Puoi richiedere fondi extra o selezionare Spesa Famiglia.`
        );
        return;
      }
    }

    addExpense({
      amount: parsedAmount,
      category,
      note: note.trim(),
      scope,
      memberId: actingMember.id,
      receiptName: receiptName || (receiptFile ? receiptFile.name : undefined),
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Registra Nuova Spesa</h2>
            <p className="text-xs text-stone-500">
              {currentMember.role === 'parent'
                ? 'Inserisci una spesa familiare o personale'
                : 'Registra una tua spesa personale o della paghetta'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Importo (€) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-lg font-medium">
                €
              </span>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                autoFocus
              />
            </div>
          </div>

          {/* Note / Description with smart suggestion */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-stone-700">
                Descrizione / Nota *
              </label>
              {suggestedCat && (
                <span className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md flex items-center gap-1 font-medium">
                  <Sparkles className="w-3 h-3" />
                  Suggerito: {suggestedCat}
                </span>
              )}
            </div>
            <input
              type="text"
              value={note}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="es. Spesa supermercato, Pizza con amici, Vocabolario..."
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Scope and Member row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Tipologia Spesa
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as 'family' | 'personal')}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="family">Famiglia (Condivisa)</option>
                <option value="personal">Personale (Paghetta)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Membro che ha speso
              </label>
              {currentMember.role === 'parent' ? (
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role === 'parent' ? 'Genitore' : 'Figlio'})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-700 font-medium">
                  {currentMember.name} (Tu)
                </div>
              )}
            </div>
          </div>

          {/* Receipt attachment upload */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Allega Scontrino / Foto (Opzionale)
            </label>
            <label className="border-2 border-dashed border-stone-200 hover:border-indigo-400 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors bg-stone-50/50 hover:bg-indigo-50/20">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {receiptName ? (
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="truncate max-w-[220px]">{receiptName}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <Upload className="w-4 h-4 text-stone-400" />
                  <span>Carica o scatta foto scontrino</span>
                </div>
              )}
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              Registra Spesa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
