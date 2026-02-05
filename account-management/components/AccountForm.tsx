
import React, { useState, useEffect } from 'react';
import { Account } from '../types';

interface AccountFormProps {
  onSave: (account: Omit<Account, 'id' | 'createdAt'>) => void;
  editingAccount?: Account;
  onCancelEdit?: () => void;
}

export const AccountForm: React.FC<AccountFormProps> = ({ onSave, editingAccount, onCancelEdit }) => {
  const [name, setName] = useState('');
  const [arr, setArr] = useState('');
  const [logins, setLogins] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [expansion, setExpansion] = useState(50);
  const [stakeholder, setStakeholder] = useState(50);

  // Effect to populate form when editingAccount changes
  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name);
      setArr(editingAccount.arr.toString());
      setLogins(editingAccount.loginsPerMonth.toString());
      setDuration(editingAccount.sessionDuration.toString());
      setNotes(editingAccount.notes);
      setExpansion(editingAccount.expansionProbability);
      setStakeholder(editingAccount.stakeholderProbability);
    } else {
      resetForm();
    }
  }, [editingAccount]);

  const resetForm = () => {
    setName('');
    setArr('');
    setLogins('');
    setDuration('');
    setNotes('');
    setExpansion(50);
    setStakeholder(50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !arr || !logins || !duration) return;

    onSave({
      name,
      arr: parseFloat(arr),
      loginsPerMonth: parseInt(logins),
      sessionDuration: parseFloat(duration),
      notes,
      expansionProbability: expansion,
      stakeholderProbability: stakeholder,
    });

    if (!editingAccount) {
      resetForm();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {editingAccount ? 'Edit Account' : 'New Account'}
        </h2>
        {editingAccount && onCancelEdit && (
          <button 
            type="button" 
            onClick={onCancelEdit}
            className="text-[10px] font-bold text-red-500 uppercase hover:underline"
          >
            Cancel
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Name</label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="e.g. Acme Corp"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ARR (EUR)</label>
          <input
            required
            type="number"
            value={arr}
            onChange={(e) => setArr(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="0"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Logins / Month</label>
          <input
            required
            type="number"
            value={logins}
            onChange={(e) => setLogins(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="0"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Session Duration (Hrs)</label>
          <input
            required
            type="number"
            step="0.1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="0.0"
          />
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expansion Probability</label>
            <span className="text-sm font-medium text-blue-600">{expansion}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={expansion}
            onChange={(e) => setExpansion(parseInt(e.target.value))}
            className="w-full cursor-pointer accent-blue-600"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stakeholder Access Probability</label>
            <span className="text-sm font-medium text-blue-600">{stakeholder}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={stakeholder}
            onChange={(e) => setStakeholder(parseInt(e.target.value))}
            className="w-full cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded h-20 resize-none focus:ring-1 focus:ring-blue-500 outline-none"
          placeholder="Additional context..."
        />
      </div>

      <button
        type="submit"
        className="w-full bg-slate-900 text-white font-medium py-2 rounded hover:bg-slate-800 transition-colors"
      >
        {editingAccount ? 'Update Account' : 'Go'}
      </button>
    </form>
  );
};
