import React from 'react';
import { X, Receipt, Download, Calendar, Tag, User } from 'lucide-react';
import { Expense } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';

interface ReceiptPreviewModalProps {
  expense: Expense | null;
  onClose: () => void;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({ expense, onClose }) => {
  if (!expense) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2 text-stone-800 font-semibold">
            <Receipt className="w-5 h-5 text-indigo-600" />
            <span>Scontrino Allegato</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Simulated Digital Receipt Paper */}
          <div className="relative bg-stone-50 border border-stone-200 rounded-xl p-5 font-mono text-xs text-stone-700 shadow-inner">
            <div className="text-center pb-3 border-b border-dashed border-stone-300">
              <div className="font-bold text-sm text-stone-900 tracking-wider uppercase">
                {expense.category}
              </div>
              <div className="text-stone-500 text-[11px] mt-0.5">{expense.note}</div>
              <div className="text-stone-400 text-[10px] mt-1">{formatDateTime(expense.date)}</div>
            </div>

            <div className="py-4 space-y-2 border-b border-dashed border-stone-300">
              <div className="flex justify-between">
                <span>DESCRIZIONE</span>
                <span>TOTALE</span>
              </div>
              <div className="flex justify-between font-medium text-stone-900">
                <span className="truncate max-w-[200px]">{expense.note}</span>
                <span>{formatCurrency(expense.amount)}</span>
              </div>
              <div className="flex justify-between text-stone-500 text-[11px]">
                <span>Tipo Transazione</span>
                <span>{expense.scope === 'family' ? 'Spesa Famiglia' : 'Spesa Personale'}</span>
              </div>
              <div className="flex justify-between text-stone-500 text-[11px]">
                <span>Registrato da</span>
                <span>{expense.memberName}</span>
              </div>
            </div>

            <div className="pt-3 flex justify-between items-center text-sm font-bold text-stone-900">
              <span>TOTALE EURO</span>
              <span className="text-base text-emerald-700">{formatCurrency(expense.amount)}</span>
            </div>

            {expense.receiptName && (
              <div className="mt-3 pt-2 border-t border-dashed border-stone-300 text-[10px] text-stone-400 flex items-center justify-between">
                <span>File allegato:</span>
                <span className="truncate max-w-[180px]">{expense.receiptName}</span>
              </div>
            )}

            {/* Sawtooth edge decoration at bottom */}
            <div className="absolute -bottom-2 left-0 right-0 h-2 bg-radial-[circle_at_50%_0] from-transparent to-transparent" />
          </div>

          {/* Metadata chips */}
          <div className="grid grid-cols-2 gap-2 text-xs text-stone-600">
            <div className="bg-stone-50 rounded-lg p-2.5 border border-stone-200/60 flex items-center gap-2">
              <Tag className="w-4 h-4 text-stone-400 shrink-0" />
              <div className="truncate">
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Categoria</span>
                <span className="font-medium text-stone-800">{expense.category}</span>
              </div>
            </div>
            <div className="bg-stone-50 rounded-lg p-2.5 border border-stone-200/60 flex items-center gap-2">
              <User className="w-4 h-4 text-stone-400 shrink-0" />
              <div className="truncate">
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Membro</span>
                <span className="font-medium text-stone-800">{expense.memberName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
