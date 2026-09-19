import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Plus,
  Trash2,
  Download,
  Calendar,
  User,
  Tag,
  Eye,
  ArrowUpDown,
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { Expense } from '../types';
import { formatCurrency, formatDate, exportToCSV } from '../utils/formatters';

interface ExpensesViewProps {
  onOpenExpenseModal: () => void;
  onViewReceipt: (expense: Expense) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  onOpenExpenseModal,
  onViewReceipt,
}) => {
  const { currentMember, members, categories, expenses, deleteExpense } = useFamily();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [selectedScope, setSelectedScope] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const isParent = currentMember.role === 'parent';

  // Teen role filter: Teens see family shared expenses OR their own personal expenses
  const roleFilteredExpenses = isParent
    ? expenses
    : expenses.filter((e) => e.scope === 'family' || e.memberId === currentMember.id);

  // Search and filter pipeline
  const filteredExpenses = roleFilteredExpenses.filter((e) => {
    const matchesSearch =
      e.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.memberName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesMember = selectedMember === 'all' || e.memberId === selectedMember;
    const matchesScope = selectedScope === 'all' || e.scope === selectedScope;

    return matchesSearch && matchesCategory && matchesMember && matchesScope;
  });

  // Sorting
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortBy === 'date') {
      const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
      return sortOrder === 'desc' ? diff : -diff;
    } else {
      const diff = b.amount - a.amount;
      return sortOrder === 'desc' ? diff : -diff;
    }
  });

  const totalFilteredSum = sortedExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleExportCSV = () => {
    const headers = ['Data', 'Descrizione', 'Categoria', 'Membro', 'Ruolo', 'Ambito', 'Importo EUR', 'Scontrino'];
    const rows = sortedExpenses.map((e) => [
      formatDate(e.date),
      e.note,
      e.category,
      e.memberName,
      e.memberRole === 'parent' ? 'Genitore' : 'Figlio',
      e.scope === 'family' ? 'Famiglia' : 'Personale',
      e.amount.toFixed(2),
      e.receiptName || 'Nessuno',
    ]);
    exportToCSV(`spese_famiglia_rossi_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Tracciamento Transazioni
            </span>
            <span className="text-[11px] bg-stone-100 text-stone-700 font-medium px-2 py-0.5 rounded-full">
              {filteredExpenses.length} registrate
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 mt-1">Storico Spese</h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Registro completo delle spese familiari e personali con allegati e categorie.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 rounded-xl transition-colors flex items-center gap-1.5"
            title="Scarica foglio di calcolo CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Esporta CSV</span>
          </button>
          <button
            onClick={onOpenExpenseModal}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registra Spesa</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca per nota, negozio o categoria..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tutte le categorie</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Member Filter */}
          <div>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tutti i membri</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Scope Filter */}
          <div>
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tutti gli ambiti</option>
              <option value="family">Spesa Famiglia</option>
              <option value="personal">Spesa Personale (Paghetta)</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Bar */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
          <span>
            Mostrati <strong className="text-stone-900">{sortedExpenses.length}</strong> risultati per un totale di{' '}
            <strong className="text-stone-900">{formatCurrency(totalFilteredSum)}</strong>
          </span>
          <button
            onClick={() => {
              setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
            }}
            className="flex items-center gap-1 font-semibold text-stone-700 hover:text-indigo-600 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>
              Ordina per {sortBy === 'date' ? 'Data' : 'Importo'} ({sortOrder === 'desc' ? 'Decrescente' : 'Crescente'})
            </span>
          </button>
        </div>
      </div>

      {/* Expenses Table Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead>
              <tr className="bg-stone-50/70 border-b border-stone-100 text-stone-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Descrizione</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Membro</th>
                <th className="py-3 px-4">Tipologia</th>
                <th className="py-3 px-4 text-right">Importo</th>
                <th className="py-3 px-4 text-center">Scontrino</th>
                <th className="py-3 px-4 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sortedExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-stone-400">
                    Nessuna spesa trovata con i filtri selezionati.
                  </td>
                </tr>
              ) : (
                sortedExpenses.map((expense) => {
                  const member = members.find((m) => m.id === expense.memberId);
                  const canDelete = isParent || expense.memberId === currentMember.id;

                  return (
                    <tr key={expense.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-stone-500 whitespace-nowrap">
                        {formatDate(expense.date)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900">{expense.note}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 text-[11px] font-medium">
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full ${member?.avatarColor || 'bg-stone-400'} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}
                          >
                            {expense.memberName.charAt(0)}
                          </div>
                          <span className="text-stone-800 font-medium whitespace-nowrap">
                            {expense.memberName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            expense.scope === 'family'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}
                        >
                          {expense.scope === 'family' ? 'Spesa Famiglia' : 'Spesa Personale'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-stone-900 text-sm whitespace-nowrap">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {expense.receiptName ? (
                          <button
                            onClick={() => onViewReceipt(expense)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold transition-colors"
                            title="Vedi scontrino"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Vedi</span>
                          </button>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {canDelete && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Eliminare la spesa "${expense.note}" di ${formatCurrency(expense.amount)}?`)) {
                                deleteExpense(expense.id);
                              }
                            }}
                            className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Elimina spesa"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
