import React, { useState } from 'react';
import {
  GraduationCap,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Award,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { formatCurrency, calculateAge } from '../utils/formatters';

export const FinancialLiteracyView: React.FC = () => {
  const { currentMember, members, expenses, allowanceRecords, savingsGoals } = useFamily();

  const isParent = currentMember.role === 'parent';
  const teens = members.filter((m) => m.role === 'teen');

  const [selectedTeenId, setSelectedTeenId] = useState<string>(
    !isParent && currentMember.role === 'teen' ? currentMember.id : teens[0]?.id || 'm3'
  );

  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const activeTeen = members.find((m) => m.id === selectedTeenId) || teens[0];

  // Calculations for selected teen this month
  const teenExpenses = expenses.filter(
    (e) => e.memberId === selectedTeenId && e.scope === 'personal'
  );
  const totalSpentByTeen = teenExpenses.reduce((sum, e) => sum + e.amount, 0);

  const teenRecords = allowanceRecords.filter((r) => r.teenId === selectedTeenId);
  const totalIncomeByTeen = teenRecords.reduce((sum, r) => sum + r.amount, 0);

  const netSavings = Math.max(0, totalIncomeByTeen - totalSpentByTeen);
  const savingsRate = totalIncomeByTeen > 0 ? Math.round((netSavings / totalIncomeByTeen) * 100) : 0;

  // Category breakdown for teen
  const categoryMap: { [cat: string]: number } = {};
  teenExpenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Modulo Didattico
            </span>
            <span className="text-[11px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-200/60">
              Pratica Finanziaria Reale
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 mt-1">
            Educazione Finanziaria per Ragazzi
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Analisi trasparente di entrate e uscite, abitudini di spesa e guide pratiche per costruire indipendenza.
          </p>
        </div>

        {/* Teen Switcher (for parents or toggle) */}
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

      {/* Teen Cashflow & Habit Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Entrate Totali */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">Entrate del Mese</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-extrabold text-emerald-700">
              {formatCurrency(totalIncomeByTeen)}
            </div>
            <p className="text-[11px] text-stone-600 mt-0.5">
              Include paghetta ordinaria ({activeTeen?.name.split(' ')[0]}) e bonus compiti completati
            </p>
          </div>
          <div className="text-[11px] font-semibold text-emerald-700 pt-2 border-t border-stone-100">
            {teenRecords.length} accrediti totali
          </div>
        </div>

        {/* Spese Totali */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">Spese Personali</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-extrabold text-stone-900">
              {formatCurrency(totalSpentByTeen)}
            </div>
            <p className="text-[11px] text-stone-600 mt-0.5">
              Spese pagate autonomamente con la paghetta
            </p>
          </div>
          <div className="text-[11px] font-semibold text-stone-600 pt-2 border-t border-stone-100">
            {teenExpenses.length} acquisti registrati
          </div>
        </div>

        {/* Tasso di Risparmio Personale */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">Tasso di Risparmio</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl font-extrabold text-purple-700">
              {savingsRate}%
            </div>
            <p className="text-[11px] text-stone-600 mt-0.5">
              {savingsRate >= 30
                ? 'Ottimo lavoro! Stai gestendo il tuo denaro con grande maturità.'
                : 'Puoi migliorare: prova a mettere da parte una quota prima di spendere.'}
            </p>
          </div>
          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-purple-600"
              style={{ width: `${Math.min(100, savingsRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Spending Habits & Top Category for Teen */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 mb-1">
          Abitudini di Spesa di {activeTeen?.name}
        </h2>
        <p className="text-xs text-stone-600 mb-4">
          Dove vanno a finire i soldi della paghetta questo mese?
        </p>

        {sortedCategories.length === 0 ? (
          <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl">
            Nessuna spesa personale registrata questo mese.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/70 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                1°
              </div>
              <div>
                <span className="text-xs text-stone-500 font-medium">Categoria principale di spesa:</span>
                <div className="text-lg font-extrabold text-stone-900">{topCategory[0]}</div>
                <div className="text-xs text-indigo-700 font-semibold mt-0.5">
                  {formatCurrency(topCategory[1])} (
                  {totalSpentByTeen > 0 ? Math.round((topCategory[1] / totalSpentByTeen) * 100) : 0}% del totale)
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {sortedCategories.map(([catName, amount]) => {
                const percent = totalSpentByTeen > 0 ? Math.round((amount / totalSpentByTeen) * 100) : 0;
                return (
                  <div key={catName} className="flex items-center justify-between text-xs p-2.5 bg-stone-50 rounded-xl">
                    <span className="font-semibold text-stone-800">{catName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-stone-500">{percent}%</span>
                      <span className="font-bold text-stone-900">{formatCurrency(amount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Practical Financial Guides & Lessons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Guide 1: Regola 50/30/20 */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">
              La Regola del 50/30/20 spiegata facile
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-3">
              Quando ricevi la paghetta (es. 25 € a settimana), un modo intelligente per non rimanere a secco è suddividerla mentalmente in tre parti:
            </p>
            <ul className="text-xs text-stone-700 space-y-1.5 pl-3 border-l-2 border-indigo-200">
              <li>
                <strong>50% Necessità:</strong> merende a scuola, biglietti del bus, materiale scolastico.
              </li>
              <li>
                <strong>30% Desideri:</strong> uscite con gli amici, gelato, cinema, giochi.
              </li>
              <li>
                <strong>20% Salvadanaio:</strong> da non toccare! Servirà per l'obiettivo che desideri di più.
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-500 font-medium">
            💡 Suggerimento: Se risparmi il 20% di 25€ (5€), in un anno hai 260€ extra!
          </div>
        </div>

        {/* Guide 2: La regola delle 24 ore */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">
              La Regola delle 24 Ore anti-impulso
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-3">
              Hai visto un vestito o una skin di un videogioco e senti il bisogno irrefrenabile di comprarla subito?
            </p>
            <p className="text-xs text-stone-700 leading-relaxed mb-3">
              <strong>Aspetta 24 ore prima di pagare.</strong> Se il giorno dopo desideri ancora quell'oggetto con la stessa intensità, allora è un acquisto ponderato. Nella maggior parte dei casi scoprirai che era solo un capriccio passeggero!
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-500 font-medium">
            🧠 Suggerimento: Prima di acquistare, chiediti sempre: "È un bisogno o un desiderio?"
          </div>
        </div>
      </div>

      {/* Interactive Micro-Quiz: Mettiti alla Prova */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Micro-Quiz Ragazzi
          </span>
        </div>
        <h3 className="text-base font-bold text-white mb-2">
          Qual è la mossa finanziaria migliore quando ricevi 20 € extra da un parente?
        </h3>

        <div className="space-y-2 mt-4">
          {[
            { id: 0, text: 'A) Spenderli tutti la sera stessa al fast food per festeggiare.' },
            { id: 1, text: 'B) Mettere subito da parte una quota nel salvadanaio e goderti il resto con gli amici.', correct: true },
            { id: 2, text: 'C) Chiedere altri 20 € ai genitori senza motivo.' },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setQuizAnswer(option.id);
                setQuizSubmitted(true);
              }}
              className={`w-full text-left p-3 rounded-xl text-xs font-medium transition-all ${
                quizAnswer === option.id
                  ? option.correct
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-rose-600 text-white font-bold'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
              }`}
            >
              {option.text}
            </button>
          ))}
        </div>

        {quizSubmitted && (
          <div className="mt-4 p-3 bg-stone-800 rounded-xl text-xs text-stone-300">
            {quizAnswer === 1 ? (
              <span className="text-emerald-400 font-bold">
                Risposta esatta! 🎉 Pagare prima se stessi (mettendo via una parte) è il segreto di chi costruisce sicurezza finanziaria!
              </span>
            ) : (
              <span className="text-amber-400 font-medium">
                Non esattamente: spendere tutto subito ti lascia senza margine per i tuoi obiettivi importanti. Riprova!
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
