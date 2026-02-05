
import React, { useState, useMemo, useEffect } from 'react';
import { Account, CalculatedAccount } from './types';
import { calculatePortfolioStats, calculateAccountScores } from './calculations';
import { AccountForm } from './components/AccountForm';
import { PortfolioMatrix } from './components/PortfolioMatrix';
import { AccountDetails } from './components/AccountDetails';
import { DataManagement } from './components/DataManagement';

const STORAGE_KEY = 'workpath_portfolio_data';

const App: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>();
  const [editingAccountId, setEditingAccountId] = useState<string | undefined>();
  const [showLabels, setShowLabels] = useState(true);

  // Persist to local storage automatically
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  // Calculations
  const calculatedData = useMemo(() => {
    const stats = calculatePortfolioStats(accounts);
    return accounts.map(acc => calculateAccountScores(acc, stats));
  }, [accounts]);

  const selectedAccount = useMemo(() => 
    calculatedData.find(a => a.id === selectedAccountId) || null
  , [calculatedData, selectedAccountId]);

  const editingAccount = useMemo(() => 
    accounts.find(a => a.id === editingAccountId)
  , [accounts, editingAccountId]);

  const handleSaveAccount = (accData: Omit<Account, 'id' | 'createdAt'>) => {
    if (editingAccountId) {
      // Update existing account
      setAccounts(prev => prev.map(acc => 
        acc.id === editingAccountId 
          ? { ...acc, ...accData } 
          : acc
      ));
      setEditingAccountId(undefined);
    } else {
      // Create new account
      const account: Account = {
        ...accData,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      setAccounts(prev => [...prev, account]);
    }
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    if (selectedAccountId === id) setSelectedAccountId(undefined);
    if (editingAccountId === id) setEditingAccountId(undefined);
  };

  const handleImport = (data: Account[]) => {
    setAccounts(data);
    setSelectedAccountId(undefined);
    setEditingAccountId(undefined);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navigation Bar in Workpath Yellow */}
      <header className="bg-[#FFEC57] border-b border-slate-300 px-8 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="bg-slate-900 w-7 h-7 rounded-sm flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">CI</span>
          </div>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-[0.2em]">COMPANY INC. Account Management</span>
        </div>
        <DataManagement portfolio={accounts} onImport={handleImport} />
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Form */}
        <section className="lg:col-span-3 space-y-6">
          <AccountForm 
            onSave={handleSaveAccount} 
            editingAccount={editingAccount}
            onCancelEdit={() => setEditingAccountId(undefined)}
          />
          
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Portfolio Overview</p>
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-slate-500">Total Accounts</span>
              <span className="text-slate-900 font-bold">{accounts.length}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-medium mt-1">
              <span className="text-slate-500">Total ARR</span>
              <span className="text-slate-900 font-bold">€{accounts.reduce((sum, a) => sum + a.arr, 0).toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* Center Column: Matrix Visualization */}
        <section className="lg:col-span-6 space-y-3">
          <div className="flex justify-end">
            <button 
              onClick={() => setShowLabels(!showLabels)}
              className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors"
            >
              <div className={`w-8 h-4 rounded-full relative transition-colors ${showLabels ? 'bg-blue-500' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${showLabels ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
              </div>
              <span>Labels: {showLabels ? 'On' : 'Off'}</span>
            </button>
          </div>
          <PortfolioMatrix 
            accounts={calculatedData} 
            onSelect={(acc) => setSelectedAccountId(acc?.id)}
            onEdit={(id) => setEditingAccountId(id)}
            selectedId={selectedAccountId}
            showLabels={showLabels}
          />
        </section>

        {/* Right Column: Account Details */}
        <section className="lg:col-span-3">
          <AccountDetails 
            account={selectedAccount} 
            onDelete={handleDeleteAccount}
            onEdit={(id) => setEditingAccountId(id)}
          />
        </section>
      </main>

      {/* Inventory Section */}
      <section className="max-w-[1400px] mx-auto w-full px-8 pb-12 overflow-x-auto">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">ARR</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Volume Score</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Potential Score</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
              </tr>
            </thead>
            <tbody>
              {calculatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm italic">No accounts in portfolio. Use the form to add your first account.</td>
                </tr>
              ) : (
                calculatedData.map((acc) => (
                  <tr 
                    key={acc.id} 
                    className={`border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${selectedAccountId === acc.id ? 'bg-blue-50/50' : ''}`}
                    onClick={() => setSelectedAccountId(acc.id)}
                  >
                    <td className="px-6 py-3 text-sm font-semibold text-slate-700">{acc.name}</td>
                    <td className="px-6 py-3 text-sm text-slate-600 text-right font-mono">€{acc.arr.toLocaleString()}</td>
                    <td className="px-6 py-3 text-sm text-slate-600 text-center">{acc.volumeScore.toFixed(1)}</td>
                    <td className="px-6 py-3 text-sm text-slate-600 text-center">{acc.potentialScore.toFixed(1)}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-200 bg-white text-slate-500">
                        {acc.category}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default App;
