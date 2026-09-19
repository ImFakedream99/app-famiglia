import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  User,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { formatCurrency, formatDate, exportToCSV, calculateAge } from '../utils/formatters';

export const ReportsView: React.FC = () => {
  const { currentMember, members, categories, expenses, allowanceRecords } = useFamily();

  const isParent = currentMember.role === 'parent';
  const teens = members.filter((m) => m.role === 'teen');

  const [selectedMonth, setSelectedMonth] = useState<'current' | 'last' | 'two_months_ago'>('current');
  const [selectedTeenReport, setSelectedTeenReport] = useState<string>(
    !isParent && currentMember.role === 'teen' ? currentMember.id : teens[0]?.id || 'm3'
  );

  // Month mock simulation:
  const monthNames = {
    current: 'Settembre 2026',
    last: 'Agosto 2026',
    two_months_ago: 'Luglio 2026',
  };

  // Historic monthly simulated totals
  const historicTotals = {
    current: expenses.reduce((a, b) => a + b.amount, 0),
    last: 2340.5,
    two_months_ago: 2180.0,
  };

  // Category totals for current month
  const categoryTotals = categories.map((cat) => {
    const catExpenses = expenses.filter((e) => e.category === cat.name);
    const total = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      name: cat.name,
      allocated: cat.allocated,
      spent: total || cat.spent,
      color: cat.color,
    };
  });

  const totalFamilySpent = categoryTotals.reduce((a, c) => a + c.spent, 0);
  const totalFamilyAllocated = categoryTotals.reduce((a, c) => a + c.allocated, 0);

  // Individual teen report calculations
  const activeTeen = members.find((m) => m.id === selectedTeenReport) || teens[0];
  const teenExpenses = expenses.filter((e) => e.memberId === selectedTeenReport && e.scope === 'personal');
  const teenRecords = allowanceRecords.filter((r) => r.teenId === selectedTeenReport);

  const teenTotalSpent = teenExpenses.reduce((a, b) => a + b.amount, 0);
  const teenTotalIncome = teenRecords.reduce((a, b) => a + b.amount, 0);

  const handleExportFullCSV = () => {
    const headers = [
      'Tipo',
      'Membro',
      'Data',
      'Categoria',
      'Descrizione',
      'Importo EUR',
      'Ambito',
      'Scontrino',
    ];
    const rows = expenses.map((e) => [
      'Spesa',
      e.memberName,
      formatDate(e.date),
      e.category,
      e.note,
      e.amount.toFixed(2),
      e.scope === 'family' ? 'Famiglia' : 'Personale',
      e.receiptName || 'N/D',
    ]);
    exportToCSV(`report_famiglia_rossi_${selectedMonth}_2026.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Analisi Economica
            </span>
            <span className="text-[11px] bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded-full">
              {monthNames[selectedMonth]}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 mt-1">Report & Insight Familiari</h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Analisi dettagliata delle spese per categoria, trend nel tempo e report individuale per ciascun figlio.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value as any)}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200/70 border border-stone-200 rounded-xl text-xs font-bold text-stone-800"
          >
            <option value="current">Settembre 2026 (Attuale)</option>
            <option value="last">Agosto 2026</option>
            <option value="two_months_ago">Luglio 2026</option>
          </select>

          <button
            onClick={handleExportFullCSV}
            className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Esporta Dati CSV</span>
          </button>
        </div>
      </div>

      {/* Monthly Multi-Month Comparison Trend (PRD 6.8) */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-stone-900">Trend di Spesa Trimestrale</h2>
            <p className="text-xs text-stone-600">Confronto dell'andamento dei costi familiari negli ultimi tre mesi</p>
          </div>
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> Trend stabile
          </span>
        </div>

        {/* 3-month comparison bars */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { label: 'Luglio 2026', total: historicTotals.two_months_ago, active: selectedMonth === 'two_months_ago' },
            { label: 'Agosto 2026', total: historicTotals.last, active: selectedMonth === 'last' },
            { label: 'Settembre 2026', total: historicTotals.current, active: selectedMonth === 'current' },
          ].map((item, idx) => {
            const heightPercent = Math.round((item.total / 3000) * 100);
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  item.active
                    ? 'bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-200'
                    : 'bg-stone-50 border-stone-200/60'
                }`}
              >
                <div className="text-xs font-semibold text-stone-600 mb-1">{item.label}</div>
                <div className="text-xl font-extrabold text-stone-900 mb-3">
                  {formatCurrency(item.total)}
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${Math.min(100, heightPercent)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown Progress Bars */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-stone-900">
          Distribuzione Spese Familiari per Categoria ({monthNames[selectedMonth]})
        </h2>

        <div className="space-y-3">
          {categoryTotals.map((cat) => {
            const percentOfTotal = totalFamilySpent > 0 ? Math.round((cat.spent / totalFamilySpent) * 100) : 0;
            const percentOfBudget = cat.allocated > 0 ? Math.round((cat.spent / cat.allocated) * 100) : 0;

            return (
              <div key={cat.name} className="p-3.5 bg-stone-50/70 rounded-2xl border border-stone-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{cat.name}</span>
                    <span className="text-[10px] text-stone-400 font-medium">
                      ({percentOfTotal}% della spesa familiare)
                    </span>
                  </div>
                  <div className="text-stone-700">
                    <strong className="text-stone-900">{formatCurrency(cat.spent)}</strong>
                    <span className="text-stone-400"> / {formatCurrency(cat.allocated)}</span>
                  </div>
                </div>

                <div className="w-full bg-stone-200/70 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentOfBudget > 100 ? 'bg-rose-500' : percentOfBudget > 80 ? 'bg-amber-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(100, percentOfBudget)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Teen Report Card (PRD 6.8: Solo per genitore e figlio interessato) */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-bold text-stone-900">
                Report Individuale: {activeTeen?.name}
              </h2>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Riepilogo dedicato e confidenziale delle entrate, uscite e risparmi personali.
            </p>
          </div>

          {/* If parent, can switch which teen to inspect */}
          {isParent && teens.length > 1 && (
            <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl">
              {teens.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeenReport(t.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    selectedTeenReport === t.id
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/60">
            <span className="text-xs text-stone-500 font-medium">Entrate Paghette & Bonus</span>
            <div className="text-xl font-extrabold text-emerald-700 mt-1">
              +{formatCurrency(teenTotalIncome)}
            </div>
            <span className="text-[11px] text-stone-400 mt-0.5 block">
              {teenRecords.length} transazioni registrate
            </span>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/60">
            <span className="text-xs text-stone-500 font-medium">Uscite & Spese Personali</span>
            <div className="text-xl font-extrabold text-amber-700 mt-1">
              -{formatCurrency(teenTotalSpent)}
            </div>
            <span className="text-[11px] text-stone-400 mt-0.5 block">
              {teenExpenses.length} acquisti effettuati
            </span>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/60">
            <span className="text-xs text-stone-500 font-medium">Saldo Disponibile</span>
            <div className="text-xl font-extrabold text-stone-900 mt-1">
              {formatCurrency(activeTeen?.allowanceBalance || 0)}
            </div>
            <span className="text-[11px] text-indigo-700 font-semibold mt-0.5 block">
              In regola con il piano
            </span>
          </div>
        </div>

        {/* Detailed expense history for this teen */}
        <div className="pt-2">
          <span className="text-xs font-bold text-stone-700 block mb-2">
            Spese personali recenti di {activeTeen?.name.split(' ')[0]}:
          </span>
          {teenExpenses.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-4 bg-stone-50 rounded-xl">
              Nessuna spesa personale registrata questo mese.
            </p>
          ) : (
            <div className="space-y-1.5">
              {teenExpenses.map((e) => (
                <div
                  key={e.id}
                  className="p-2.5 bg-stone-50/70 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-stone-900">{e.note}</span>
                    <span className="text-stone-400 text-[11px] ml-2">({e.category})</span>
                  </div>
                  <span className="font-bold text-stone-900">{formatCurrency(e.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
