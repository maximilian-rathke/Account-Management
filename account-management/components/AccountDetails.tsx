
import React from 'react';
import { CalculatedAccount } from '../types';
import { getCategoryColor } from '../calculations';

interface AccountDetailsProps {
  account: CalculatedAccount | null;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export const AccountDetails: React.FC<AccountDetailsProps> = ({ account, onDelete, onEdit }) => {
  if (!account) {
    return (
      <div className="bg-white p-6 rounded-lg border border-slate-200 border-dashed flex items-center justify-center h-full">
        <p className="text-slate-400 text-sm">Select an account on the matrix to view details</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-slate-800">{account.name}</h3>
          <div 
            className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: getCategoryColor(account.category) }}
          >
            {account.category}
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(account.id)}
            className="text-xs text-blue-500 hover:text-blue-700 font-medium px-2 py-1 border border-blue-100 rounded hover:bg-blue-50 transition-colors"
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete(account.id)}
            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 border border-red-100 rounded hover:bg-red-50 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate-50 rounded border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase">ARR (EUR)</p>
          <p className="text-lg font-semibold text-slate-700">€{account.arr.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Engagement</p>
          <p className="text-lg font-semibold text-slate-700">{Math.round(account.engagement)} hrs</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-[11px] font-bold uppercase text-slate-500 mb-1">
            <span>Volume Score</span>
            <span>{account.volumeScore.toFixed(1)}/100</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-slate-400 transition-all duration-500" style={{ width: `${account.volumeScore}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[11px] font-bold uppercase text-slate-500 mb-1">
            <span>Potential Score</span>
            <span>{account.potentialScore.toFixed(1)}/100</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${account.potentialScore}%` }} />
          </div>
        </div>
      </div>

      {account.notes && (
        <div className="pt-4 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Notes</p>
          <p className="text-sm text-slate-600 italic">"{account.notes}"</p>
        </div>
      )}
    </div>
  );
};
