
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, LayoutDashboard, History, FileText, TrendingUp, Check, Download, Upload, CheckCircle } from 'lucide-react';
import { Transaction, AccountType, TransactionType } from './types';
import Dashboard from './components/Dashboard';
import Ledger from './components/Ledger';
import TransactionForm from './components/TransactionForm';
import Report from './components/Report';
import { getFinancialInsights } from './geminiService';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ryan-money-monitor-data');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [accountFilter, setAccountFilter] = useState<AccountType | 'all'>('all');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('ryan-money-monitor-data', JSON.stringify(transactions));
    // Brief visual confirmation for "Autosave"
    setShowSavedToast(true);
    const timer = setTimeout(() => setShowSavedToast(false), 2000);
    return () => clearTimeout(timer);
  }, [transactions]);

  const balances = useMemo(() => {
    return transactions.reduce((acc, t) => {
      const amount = t.type === TransactionType.DEPOSIT ? t.amount : -t.amount;
      if (t.account === AccountType.CHECKING) acc.checking += amount;
      else acc.savings += amount;
      return acc;
    }, { checking: 0, savings: 0 });
  }, [transactions]);

  const handleAddOrEditTransaction = (transaction: Transaction) => {
    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
    } else {
      setTransactions(prev => [...prev, transaction]);
    }
    setEditingTransaction(null);
    setIsFormOpen(false);
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Delete this transaction forever?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleEditRequest = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const fetchInsights = async () => {
    if (transactions.length === 0) return;
    setIsLoadingInsight(true);
    const insight = await getFinancialInsights(transactions);
    setAiInsight(insight);
    setIsLoadingInsight(false);
  };

  const toggleAccountFilter = (acc: AccountType) => {
    setAccountFilter(prev => prev === acc ? 'all' : acc);
  };

  const filteredTransactions = useMemo(() => {
    if (accountFilter === 'all') return transactions;
    return transactions.filter(t => t.account === accountFilter);
  }, [transactions, accountFilter]);

  const exportData = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `ryan-money-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json) && window.confirm('This will replace your current records with the ones from the file. Continue?')) {
          setTransactions(json);
        }
      } catch (err) {
        alert('Oops! That file doesn\'t look like a valid backup.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#f8fafc] text-slate-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="no-print hidden md:flex w-72 bg-slate-900 text-white p-8 flex-col space-y-8 sticky top-0 h-screen">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20">
              <TrendingUp size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none uppercase text-white">Monitor</h1>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Ryan's Finances</p>
            </div>
          </div>
          {showSavedToast && (
            <div className="animate-pulse">
              <CheckCircle size={18} className="text-green-400" />
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-indigo-600 shadow-xl shadow-indigo-600/30' : 'hover:bg-slate-800 opacity-60 hover:opacity-100'}`}
          >
            <LayoutDashboard size={22} strokeWidth={2.5} />
            <span className="font-bold">Home View</span>
          </button>
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'ledger' ? 'bg-indigo-600 shadow-xl shadow-indigo-600/30' : 'hover:bg-slate-800 opacity-60 hover:opacity-100'}`}
          >
            <History size={22} strokeWidth={2.5} />
            <span className="font-bold">Audit Logs</span>
          </button>
        </nav>

        <div className="space-y-3 pt-6 border-t border-slate-800/50">
          <button 
            onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }}
            className="w-full bg-white text-indigo-600 hover:bg-slate-100 font-black py-4 rounded-2xl flex items-center justify-center space-x-3 shadow-xl transition active:scale-95"
          >
            <Plus size={22} strokeWidth={3} />
            <span>Add Transaction</span>
          </button>
          <button 
            onClick={() => setIsReportOpen(true)}
            className="w-full bg-slate-800 text-white hover:bg-slate-700 font-bold py-3.5 rounded-2xl flex items-center justify-center space-x-2 transition"
          >
            <FileText size={18} />
            <span>Reports</span>
          </button>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button 
              onClick={exportData}
              title="Save a backup file"
              className="flex items-center justify-center space-x-2 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition"
            >
              <Download size={14} />
              <span>Backup</span>
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              title="Import from a backup file"
              className="flex items-center justify-center space-x-2 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition"
            >
              <Upload size={14} />
              <span>Restore</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={importData} 
            />
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Mobile App Header */}
        <header className="md:hidden pt-12 pb-4 px-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-40">
           <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-600 rounded-xl">
              <TrendingUp size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase">Ryan</h1>
            {showSavedToast && <CheckCircle size={16} className="text-green-500 ml-1" />}
          </div>
          <button 
            onClick={() => setIsReportOpen(true)}
            className="p-2.5 bg-slate-50 rounded-full border border-slate-100"
          >
            <FileText size={22} className="text-slate-600" />
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:p-12 hide-scrollbar">
          <div className="max-w-5xl mx-auto space-y-8">
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                  Portfolio <span className="text-indigo-600">Overview</span>
                </h2>
                <p className="text-slate-500 font-medium mt-1">Select an account to filter your history.</p>
              </div>
              
              <div className="flex items-center space-x-3 w-full md:w-auto">
                {/* Checking Card */}
                <button 
                  onClick={() => toggleAccountFilter(AccountType.CHECKING)}
                  className={`flex-1 md:min-w-[170px] p-5 rounded-[2rem] shadow-sm border-2 transition-all relative text-left active:scale-95 ${
                    accountFilter === AccountType.CHECKING 
                    ? 'bg-white border-indigo-600 ring-4 ring-indigo-600/20' 
                    : 'bg-white border-transparent hover:border-slate-200'
                  }`}
                >
                  {accountFilter === AccountType.CHECKING && (
                    <div className="absolute top-4 right-4 bg-indigo-600 text-white rounded-full p-0.5">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  )}
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Checking</p>
                  <p className={`text-2xl font-black tracking-tighter ${balances.checking >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                    ${balances.checking.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </button>

                {/* Savings Card */}
                <button 
                  onClick={() => toggleAccountFilter(AccountType.SAVINGS)}
                  className={`flex-1 md:min-w-[170px] p-5 rounded-[2rem] shadow-xl transition-all relative text-left active:scale-95 ${
                    accountFilter === AccountType.SAVINGS 
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/30 border-2 border-white/20' 
                    : 'bg-indigo-500 text-white border-2 border-transparent'
                  }`}
                >
                  {accountFilter === AccountType.SAVINGS && (
                    <div className="absolute top-4 right-4 bg-white text-indigo-600 rounded-full p-0.5">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  )}
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${accountFilter === AccountType.SAVINGS ? 'text-indigo-100' : 'text-indigo-100/70'}`}>Savings</p>
                  <p className="text-2xl font-black tracking-tighter">
                    ${balances.savings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </button>
              </div>
            </section>

            <div className="tab-content">
              {activeTab === 'dashboard' ? (
                <Dashboard 
                  transactions={filteredTransactions} 
                  balances={balances} 
                  aiInsight={aiInsight}
                  onRefreshInsight={fetchInsights}
                  isLoadingInsight={isLoadingInsight}
                />
              ) : (
                <Ledger 
                  transactions={filteredTransactions} 
                  onEdit={handleEditRequest} 
                  onDelete={handleDeleteTransaction}
                />
              )}
            </div>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="no-print md:hidden bg-white/80 backdrop-blur-xl border-t border-slate-100 px-10 safe-bottom flex items-center justify-between h-20 z-50">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center space-y-1 transition-all duration-300 ${activeTab === 'dashboard' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}
          >
            <LayoutDashboard size={26} strokeWidth={activeTab === 'dashboard' ? 3 : 2} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Dash</span>
          </button>

          <button 
            onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }}
            className="relative -top-6 bg-slate-900 text-white p-4.5 rounded-[2rem] shadow-2xl shadow-indigo-900/30 ring-8 ring-[#f8fafc] transition-transform active:scale-90"
          >
            <Plus size={32} strokeWidth={3} />
          </button>

          <button 
            onClick={() => setActiveTab('ledger')}
            className={`flex flex-col items-center space-y-1 transition-all duration-300 ${activeTab === 'ledger' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}
          >
            <History size={26} strokeWidth={activeTab === 'ledger' ? 3 : 2} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Logs</span>
          </button>
        </nav>
      </div>

      {/* Overlays */}
      {isFormOpen && (
        <TransactionForm 
          onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }} 
          onSubmit={handleAddOrEditTransaction} 
          initialData={editingTransaction}
        />
      )}

      {isReportOpen && (
        <Report 
          transactions={transactions} 
          balances={balances} 
          onClose={() => setIsReportOpen(false)} 
        />
      )}

      {/* Print View */}
      <div className="print-only p-12 bg-white text-black min-h-screen w-full">
         <Report 
          transactions={transactions} 
          balances={balances} 
          onClose={() => {}} 
          isPrintView={true}
        />
      </div>
    </div>
  );
};

export default App;
