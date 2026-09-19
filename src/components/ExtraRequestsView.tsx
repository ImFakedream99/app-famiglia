import React, { useState } from 'react';
import {
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit3,
  Check,
  X,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { ExtraFundRequest } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export const ExtraRequestsView: React.FC = () => {
  const {
    currentMember,
    requests,
    submitExtraFundRequest,
    resolveExtraFundRequest,
  } = useFamily();

  const isParent = currentMember.role === 'parent';

  // Request form state (for teen)
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');

  // Parent review modal state
  const [resolvingRequest, setResolvingRequest] = useState<ExtraFundRequest | null>(null);
  const [approvedAmount, setApprovedAmount] = useState('');
  const [parentNote, setParentNote] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'modify' | 'reject'>('approve');

  // Filter requests based on role
  const visibleRequests = isParent
    ? requests
    : requests.filter((r) => r.teenId === currentMember.id);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      setFormError('Inserisci un importo valido.');
      return;
    }
    if (!reason.trim()) {
      setFormError('Specifica una motivazione per la richiesta.');
      return;
    }
    submitExtraFundRequest(parsed, reason.trim());
    setAmount('');
    setReason('');
    setFormError('');
  };

  const handleOpenReview = (req: ExtraFundRequest, action: 'approve' | 'modify' | 'reject') => {
    setResolvingRequest(req);
    setActionType(action);
    setApprovedAmount(req.requestedAmount.toString());
    setParentNote('');
  };

  const handleConfirmResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingRequest) return;

    if (actionType === 'reject') {
      resolveExtraFundRequest(resolvingRequest.id, 'rejected', 0, parentNote.trim() || undefined);
    } else if (actionType === 'modify') {
      const parsed = parseFloat(approvedAmount.replace(',', '.'));
      if (isNaN(parsed) || parsed <= 0) return;
      resolveExtraFundRequest(resolvingRequest.id, 'modified', parsed, parentNote.trim() || undefined);
    } else {
      resolveExtraFundRequest(
        resolvingRequest.id,
        'approved',
        resolvingRequest.requestedAmount,
        parentNote.trim() || undefined
      );
    }

    setResolvingRequest(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
            Fondi Straordinari
          </span>
          <span className="text-[11px] bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded-full">
            {requests.filter((r) => r.status === 'pending').length} in attesa
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-stone-900 mt-1">Richieste Fondi Extra</h1>
        <p className="text-xs text-stone-600 mt-0.5">
          {isParent
            ? 'Supervisiona e gestisci le richieste di denaro extra inviate dai figli per imprevisti o materiali scolastici.'
            : 'Hai bisogno di fondi extra per un libro, un progetto o un imprevisto? Invia una richiesta motivata ai genitori.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teen Request Form (if active user is a teen) */}
        {!isParent && (
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs h-fit">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-stone-900">Invia Nuova Richiesta</h2>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Importo Richiesto (€) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-medium">
                    €
                  </span>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-lg font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Motivazione della Richiesta *
                </label>
                <textarea
                  rows={3}
                  placeholder="Spiega per cosa ti servono questi soldi (es. libro per la scuola, scarpe rotte, gita scolastica...)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
              >
                Invia Richiesta ai Genitori
              </button>
            </form>
          </div>
        )}

        {/* Requests List */}
        <div className={`${!isParent ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3`}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-stone-900">
              {isParent ? 'Tutte le Richieste Ricevute' : 'Le Tue Richieste'}
            </h2>
            <span className="text-xs text-stone-500">{visibleRequests.length} totali</span>
          </div>

          {visibleRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-stone-200/80 text-center text-stone-400 text-xs">
              Nessuna richiesta di fondi registrata.
            </div>
          ) : (
            visibleRequests.map((req) => {
              const isPending = req.status === 'pending';
              const isApproved = req.status === 'approved';
              const isModified = req.status === 'modified';
              const isRejected = req.status === 'rejected';

              return (
                <div
                  key={req.id}
                  className={`bg-white rounded-2xl p-5 border transition-all ${
                    isPending
                      ? 'border-amber-200 bg-amber-50/20 shadow-xs'
                      : 'border-stone-200/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-stone-900">
                          {req.teenName}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="text-[11px] text-stone-400">
                          {formatDateTime(req.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-stone-700 font-medium mb-2">"{req.reason}"</p>

                      {/* Parent feedback note if resolved */}
                      {req.parentNote && (
                        <div className="p-2.5 bg-stone-50 border border-stone-200/60 rounded-xl text-xs text-stone-600 flex items-start gap-1.5 mt-2">
                          <MessageSquare className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Nota genitore:</strong> {req.parentNote}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Amount & Status Badge */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-lg font-extrabold text-stone-900">
                          {formatCurrency(req.requestedAmount)}
                        </div>
                        {req.approvedAmount !== undefined && req.status === 'modified' && (
                          <div className="text-[11px] font-bold text-indigo-700">
                            Approvati: {formatCurrency(req.approvedAmount)}
                          </div>
                        )}
                      </div>

                      {/* Status Pills */}
                      {isPending && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> In Attesa
                        </span>
                      )}
                      {isApproved && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Approvata
                        </span>
                      )}
                      {isModified && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                          <Edit3 className="w-3 h-3" /> Modificata
                        </span>
                      )}
                      {isRejected && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Rifiutata
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Parent Action Buttons if Pending */}
                  {isParent && isPending && (
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenReview(req, 'reject')}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        Rifiuta
                      </button>
                      <button
                        onClick={() => handleOpenReview(req, 'modify')}
                        className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
                      >
                        Modifica Importo
                      </button>
                      <button
                        onClick={() => handleOpenReview(req, 'approve')}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approva Intero ({formatCurrency(req.requestedAmount)})</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Review Modal for Parents */}
      {resolvingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-1">
              {actionType === 'approve'
                ? 'Approva Richiesta'
                : actionType === 'modify'
                ? 'Modifica Importo Richiesta'
                : 'Rifiuta Richiesta'}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Richiesta di {resolvingRequest.teenName}: "{resolvingRequest.reason}" (
              {formatCurrency(resolvingRequest.requestedAmount)})
            </p>

            <form onSubmit={handleConfirmResolution} className="space-y-4">
              {actionType === 'modify' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nuovo Importo da Accreditare (€) *
                  </label>
                  <input
                    type="text"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-base font-bold text-stone-900"
                    autoFocus
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nota / Spiegazione per {resolvingRequest.teenName}
                </label>
                <textarea
                  rows={2}
                  placeholder="Aggiungi una nota educativa o spiegazione..."
                  value={parentNote}
                  onChange={(e) => setParentNote(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingRequest(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 text-xs font-bold text-white rounded-xl shadow-xs ${
                    actionType === 'reject'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  Conferma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
