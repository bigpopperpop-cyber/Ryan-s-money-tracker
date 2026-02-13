
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, LayoutDashboard, History, FileText, TrendingUp, Check, Download, Upload, CheckCircle, Share2, X, Info } from 'lucide-react';
import { Transaction, AccountType, TransactionType } from './types';
import Dashboard from './components/Dashboard';
import Ledger from './components/Ledger';
import TransactionForm from './components/TransactionForm';
import Report from './components/Report';
import { getFinancialInsights } from './geminiService';

const App: React.FC = () => {
  // Persistence State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ryan-money-monitor-data');
    return saved ? JSON.parse(saved) : [];
  });
  
  // App State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [accountFilter, setAccountFilter] = useState<AccountType | 'all'>('all');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [isSharedMode, setIsSharedMode] = useState(false);
  const [sharedData, setSharedData] = useState<Transaction[] | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load shared data from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get('share');
    if (dataParam) {
      try {
        const decodedData = JSON.parse(atob(decodeURIComponent(dataParam)));
        if (Array.isArray(decodedData)) {
          setSharedData(decodedData);
          setIsSharedMode(true);
          // Temporary switch to view shared data
          setTransactions(decodedData);
        }
      } catch (err) {
        console.error("Failed to decode shared data", err);
      }
    }
  }, []);

  // Auto-save logic (only if NOT in shared mode)
  useEffect(() => {
    if (!isSharedMode) {
      localStorage.setItem('ryan-money-monitor-data', JSON.stringify(transactions));
      setShowSavedToast(true);
      const timer = setTimeout(() => setShowSavedToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [transactions, isSharedMode]);

  const balances = useMemo(() => {
    return transactions.reduce((acc, t) => {
      const amount = t.type === TransactionType.DEPOSIT ? t.amount : -t.amount;
      if (t.account === AccountType.CHECKING) acc.checking += amount;
      else acc.savings += amount;
      return acc;
    }, { checking: 0, savings: 0 });
  }, [transactions]);

  const handleAddOrEditTransaction = (transaction: Transaction) => {
    if (isSharedMode) return;
    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
    } else {
      setTransactions(prev => [...prev, transaction]);
    }
    setEditingTransaction(null);
    setIsFormOpen(false);
  };

  const handleDeleteTransaction = (id: string) => {
    if (isSharedMode) return;
    if (window.confirm('Delete this transaction forever?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleEditRequest = (transaction: Transaction) => {
    if (isSharedMode) return;
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

  // Export/Share Logic
  const exportData = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `ryan-money-backup-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const generateShareLink = () => {
    try {
      // Limit to last 100 transactions to keep URL length manageable
      const sharedSubset = transactions.slice(-100);
      const encoded = btoa(JSON.stringify(sharedSubset));
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodeURIComponent(encoded)}`;
      
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert("Shareable link copied to clipboard! You can now send this link to anyone to show them your progress.");
      });
    } catch (e) {
      alert("Too much data to share via link. Please use the 'Backup' button instead!");
    }
  };

  const exitSharedMode = () => {
    const saved = localStorage.getItem('ryan-money-monitor-data');
    setTransactions(saved ? JSON.parse(saved) : []);
    setIsSharedMode(false);
    setSharedData(null);
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const importSharedData = () => {
    if (window.confirm("Do you want to overwrite your own data with this shared portfolio?")) {
      localStorage.setItem('ryan-money-monitor-data', JSON.stringify(transactions));
      setIsSharedMode(false);
      window.history.replaceState({}, document.title, window.location.pathname);
      alert("Data imported successfully!");
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json) && window.confirm('Replace current records with the ones from the file?')) {
          setTransactions(json);
        }
      } catch (err) {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#f8fafc] text-slate-900 overflow-hidden">
      {/* Shared Mode Banner */}
      {isSharedMode && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-indigo-600 text-white p-3 flex items-center justify-center space-x-4 shadow-xl">
          <div className="flex items-center space-x-2">
            <Info size={18} />
            <span className="text-sm font-black uppercase tracking-tighter">Viewing a Shared Portfolio</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={importSharedData}
              className="px-4 py-1.5 bg-white text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition"
            >
              Import This Data
            </button>
            <button 
              onClick={exitSharedMode}
              className="px-4 py-1.5 bg-indigo-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-400 transition flex items-center space-x-1"
            >
              <X size={12} strokeWidth={3} />
              <span>Exit View</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`no-print hidden md:flex w-72 bg-slate-900 text-white p-8 flex-col space-y-8 sticky top-0 h-screen transition-all ${isSharedMode ? 'pt-24' : ''}`}>
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
          {!isSharedMode && showSavedToast && (
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
          {!isSharedMode && (
            <button 
              onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }}
              className="w-full bg-white text-indigo-600 hover:bg-slate-100 font-black py-4 rounded-2xl flex items-center justify-center space-x-3 shadow-xl transition active:scale-95"
            >
              <Plus size={22} strokeWidth={3} />
              <span>Add Transaction</span>
            </button>
          )}
          
          <button 
            onClick={() => setIsReportOpen(true)}
            className="w-full bg-slate-800 text-white hover:bg-slate-700 font-bold py-3.5 rounded-2xl flex items-center justify-center space-x-2 transition"
          >
            <FileText size={18} />
            <span>Reports</span>
          </button>
          
          <button 
            onClick={generateShareLink}
            className="w-full bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 font-black py-3 rounded-2xl flex items-center justify-center space-x-2 transition"
          >
            <Share2 size={16} strokeWidth={2.5} />
            <span className="text-xs uppercase tracking-widest">Share Link</span>
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
              onClick={() => !isSharedMode && fileInputRef.current?.click()}
              disabled={isSharedMode}
              title="Import from a backup file"
              className="flex items-center justify-center space-x-2 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition disabled:opacity-30"
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
      <div className={`flex-1 flex flex-col min-h-0 overflow-hidden transition-all ${isSharedMode ? 'mt-14 md:mt-0' : ''}`}>
        {/* Mobile App Header */}
        <header className="md:hidden pt-12 pb-4 px-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-40">
           <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-600 rounded-xl">
              <TrendingUp size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase">Ryan</h1>
            {!isSharedMode && showSavedToast && <CheckCircle size={16} className="text-green-500 ml-1" />}
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={generateShareLink}
              className="p-2.5 bg-slate-50 rounded-full border border-slate-100"
            >
              <Share2 size={20} className="text-indigo-600" />
            </button>
            <button 
              onClick={() => setIsReportOpen(true)}
              className="p-2.5 bg-slate-50 rounded-full border border-slate-100"
            >
              <FileText size={22} className="text-slate-600" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:p-12 hide-scrollbar">
          <div className="max-w-5xl mx-auto space-y-8">
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                  Portfolio <span className="text-indigo-600">Overview</span>
                </h2>
                <p className="text-slate-500 font-medium mt-1">
                  {isSharedMode ? "Currently viewing a shared history." : "Select an account to filter your history."}
                </p>
              </div>
              
              <div className="flex items-center space-x-3 w-full md:w-auto">
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
                  isReadOnly={isSharedMode}
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

          {!isSharedMode && (
            <button 
              onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }}
              className="relative -top-6 bg-slate-900 text-white p-4.5 rounded-[2rem] shadow-2xl shadow-indigo-900/30 ring-8 ring-[#f8fafc] transition-transform active:scale-90"
            >
              <Plus size={32} strokeWidth={3} />
            </button>
          )}

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
