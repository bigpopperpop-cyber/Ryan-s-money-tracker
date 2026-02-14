
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, LayoutDashboard, History, FileText, TrendingUp, Download, Upload, CheckCircle, Share2, X, Info, Settings2, Save, DollarSign, RefreshCcw } from 'lucide-react';
import { Transaction, AccountType, TransactionType, DEFAULT_CATEGORIES } from './types';
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

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('ryan-money-monitor-categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [startingBalance, setStartingBalance] = useState<number>(() => {
    const saved = localStorage.getItem('ryan-money-monitor-start');
    return saved ? parseFloat(saved) : 0;
  });
  
  // App State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [isSharedMode, setIsSharedMode] = useState(false);
  const [tempStartBalance, setTempStartBalance] = useState<string>(startingBalance.toString());
  
  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const mainRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get('share');
    const startParam = params.get('start');
    if (dataParam) {
      try {
        const decodedData = JSON.parse(atob(decodeURIComponent(dataParam)));
        if (Array.isArray(decodedData)) {
          setIsSharedMode(true);
          setTransactions(decodedData);
          if (startParam) setStartingBalance(parseFloat(startParam));
        }
      } catch (err) {
        console.error("Failed to decode shared data", err);
      }
    }
  }, []);

  useEffect(() => {
    if (!isSharedMode) {
      localStorage.setItem('ryan-money-monitor-data', JSON.stringify(transactions));
      localStorage.setItem('ryan-money-monitor-categories', JSON.stringify(categories));
      localStorage.setItem('ryan-money-monitor-start', startingBalance.toString());
      setShowSavedToast(true);
      const timer = setTimeout(() => setShowSavedToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [transactions, categories, startingBalance, isSharedMode]);

  const totalBalance = useMemo(() => {
    return startingBalance + transactions.reduce((acc, t) => {
      const amount = t.type === TransactionType.DEPOSIT ? t.amount : -t.amount;
      return acc + amount;
    }, 0);
  }, [transactions, startingBalance]);

  // Pull to refresh logic
  const handleTouchStart = (e: React.TouchEvent) => {
    if (mainRef.current && mainRef.current.scrollTop === 0) {
      startY.current = e.touches[0].pageY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling) return;
    const currentY = e.touches[0].pageY;
    const diff = currentY - startY.current;
    
    if (diff > 0 && mainRef.current && mainRef.current.scrollTop === 0) {
      // Add resistance to the pull
      const resistedDiff = Math.pow(diff, 0.8);
      setPullDistance(Math.min(resistedDiff, 100));
      // Prevent default browser refresh/scroll behavior during pull
      if (diff > 10) e.preventDefault();
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      fetchInsights();
    }
    setIsPulling(false);
    setPullDistance(0);
  };

  const handleAddOrEditTransaction = (transaction: Transaction) => {
    if (isSharedMode) return;
    if (!categories.includes(transaction.category)) {
      setCategories(prev => [...prev, transaction.category]);
    }
    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
    } else {
      setTransactions(prev => [...prev, transaction]);
    }
    setEditingTransaction(null);
    setIsFormOpen(false);
  };

  const handleSaveStartingBalance = () => {
    const val = parseFloat(tempStartBalance);
    if (!isNaN(val)) {
      setStartingBalance(val);
      setIsSettingsOpen(false);
    }
  };

  const handleDeleteCategory = (cat: string) => {
    if (window.confirm(`Remove "${cat}" from your shortcuts?`)) {
      setCategories(prev => prev.filter(c => c !== cat));
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (isSharedMode) return;
    if (window.confirm('Delete this entry forever?')) {
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

  const generateShareLink = () => {
    try {
      const sharedSubset = transactions.slice(-100);
      const encoded = btoa(JSON.stringify(sharedSubset));
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodeURIComponent(encoded)}&start=${startingBalance}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert("Link copied! Share it to show your progress.");
      });
    } catch (e) {
      alert("Error sharing. Try a manual backup.");
    }
  };

  const exitSharedMode = () => {
    const saved = localStorage.getItem('ryan-money-monitor-data');
    const start = localStorage.getItem('ryan-money-monitor-start');
    setTransactions(saved ? JSON.parse(saved) : []);
    setStartingBalance(start ? parseFloat(start) : 0);
    setIsSharedMode(false);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#f8fafc] text-slate-900 overflow-hidden select-none">
      {isSharedMode && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-indigo-600 text-white pt-10 pb-3 px-4 flex items-center justify-between shadow-xl">
          <div className="flex items-center space-x-2">
            <Info size={16} />
            <span className="text-xs font-black uppercase tracking-tighter">Shared View</span>
          </div>
          <button onClick={exitSharedMode} className="px-4 py-2 bg-indigo-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest ios-tap">
            Exit
          </button>
        </div>
      )}

      {/* Pull-to-refresh Indicator */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none transition-all duration-200"
        style={{ 
          height: `${pullDistance}px`, 
          opacity: pullDistance / 60,
          transform: `translateY(${pullDistance > 20 ? 0 : -20}px)` 
        }}
      >
        <div className={`p-2 bg-white rounded-full shadow-lg border border-slate-100 ${isLoadingInsight ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullDistance * 3}deg)` }}>
          <RefreshCcw size={20} className="text-indigo-600" />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`no-print hidden md:flex w-72 bg-slate-900 text-white p-8 flex-col space-y-8 h-screen ${isSharedMode ? 'pt-24' : ''}`}>
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500 rounded-2xl shadow-lg">
            <TrendingUp size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">Savings</h1>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Ryan's Monitor</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-indigo-600 shadow-xl' : 'hover:bg-slate-800 opacity-60'}`}>
            <LayoutDashboard size={22} strokeWidth={2.5} />
            <span className="font-bold">Home</span>
          </button>
          <button onClick={() => setActiveTab('ledger')} className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'ledger' ? 'bg-indigo-600 shadow-xl' : 'hover:bg-slate-800 opacity-60'}`}>
            <History size={22} strokeWidth={2.5} />
            <span className="font-bold">History</span>
          </button>
        </nav>

        <div className="space-y-3 pt-6 border-t border-slate-800/50">
          {!isSharedMode && (
            <button onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }} className="w-full bg-white text-indigo-600 font-black py-4 rounded-2xl flex items-center justify-center space-x-3 ios-tap">
              <Plus size={22} strokeWidth={3} />
              <span>Add Entry</span>
            </button>
          )}
          <button onClick={() => setIsReportOpen(true)} className="w-full bg-slate-800 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center space-x-2 transition">
            <FileText size={18} />
            <span>Reports</span>
          </button>
          <button onClick={generateShareLink} className="w-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-black py-3 rounded-2xl flex items-center justify-center space-x-2 transition">
            <Share2 size={16} />
            <span className="text-xs uppercase tracking-widest">Share</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div 
        className={`flex-1 flex flex-col min-h-0 overflow-hidden relative transition-transform duration-200 ${isSharedMode ? 'mt-14' : ''}`}
        style={{ transform: `translateY(${pullDistance}px)` }}
      >
        <header className="md:hidden pt-[env(safe-area-inset-top,48px)] pb-4 px-6 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between sticky top-0 z-40">
           <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-600 rounded-xl"><TrendingUp size={18} className="text-white" /></div>
            <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase">Ryan</h1>
            {!isSharedMode && showSavedToast && <CheckCircle size={16} className="text-green-500 ml-1" />}
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 bg-slate-50 rounded-full border border-slate-100 ios-tap"><Settings2 size={20} className="text-slate-600" /></button>
            <button onClick={() => setIsReportOpen(true)} className="p-2.5 bg-slate-50 rounded-full border border-slate-100 ios-tap"><FileText size={20} className="text-slate-600" /></button>
          </div>
        </header>

        <main 
          ref={mainRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex-1 overflow-y-auto px-4 pt-6 pb-32 md:p-12 hide-scrollbar"
        >
          <div className="max-w-5xl mx-auto space-y-8">
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="hidden md:block">
                <h2 className="text-3xl font-black text-slate-900 leading-tight">My <span className="text-indigo-600">Savings</span></h2>
                <p className="text-slate-500 font-medium">Tracking your financial progress.</p>
              </div>
              <div className="w-full md:w-auto">
                <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl relative text-center md:text-left overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl -mr-10 -mt-10"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-slate-400">Current Balance</p>
                  <p className="text-5xl font-black tracking-tighter">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </section>

            <div className="tab-content pb-10">
              {activeTab === 'dashboard' ? (
                <Dashboard 
                  transactions={transactions} 
                  balance={totalBalance} 
                  startingBalance={startingBalance}
                  aiInsight={aiInsight} 
                  onRefreshInsight={fetchInsights} 
                  isLoadingInsight={isLoadingInsight} 
                />
              ) : (
                <Ledger transactions={transactions} onEdit={handleEditRequest} onDelete={handleDeleteTransaction} isReadOnly={isSharedMode} />
              )}
            </div>
          </div>
        </main>

        <nav className="no-print md:hidden fixed bottom-6 left-6 right-6 h-20 bg-slate-900 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-slate-800 flex items-center justify-between px-10 z-[80] animate-in slide-in-from-bottom-10 duration-500">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex flex-col items-center space-y-1 transition-all duration-300 ios-tap ${activeTab === 'dashboard' ? 'text-indigo-400 scale-110' : 'text-slate-500'}`}
          >
            <LayoutDashboard size={26} strokeWidth={activeTab === 'dashboard' ? 3 : 2} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Dash</span>
          </button>
          
          {!isSharedMode && (
            <button 
              onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }} 
              className="bg-indigo-600 text-white p-4.5 rounded-[2rem] shadow-xl shadow-indigo-900/30 -mt-12 ring-[10px] ring-white ios-tap"
            >
              <Plus size={36} strokeWidth={3} />
            </button>
          )}
          
          <button 
            onClick={() => setActiveTab('ledger')} 
            className={`flex flex-col items-center space-y-1 transition-all duration-300 ios-tap ${activeTab === 'ledger' ? 'text-indigo-400 scale-110' : 'text-slate-500'}`}
          >
            <History size={26} strokeWidth={activeTab === 'ledger' ? 3 : 2} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Logs</span>
          </button>
        </nav>
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm p-8 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Starting Fund</h3>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 bg-slate-50 rounded-full ios-tap"><X size={20} /></button>
              </div>
              <p className="text-sm text-slate-500 font-medium mb-6">What balance did you start with?</p>
              <div className="relative mb-8">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">$</span>
                <input 
                  type="number" 
                  inputMode="decimal"
                  step="0.01"
                  value={tempStartBalance}
                  onChange={(e) => setTempStartBalance(e.target.value)}
                  className="w-full pl-10 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none text-2xl font-black"
                />
              </div>
              <button 
                onClick={handleSaveStartingBalance}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest ios-tap"
              >
                Set Amount
              </button>
           </div>
        </div>
      )}

      {isFormOpen && (
        <TransactionForm 
          onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }} 
          onSubmit={handleAddOrEditTransaction} 
          onDeleteCategory={handleDeleteCategory}
          categories={categories}
          initialData={editingTransaction}
        />
      )}
      {isReportOpen && <Report transactions={transactions} balance={totalBalance} startingBalance={startingBalance} onClose={() => setIsReportOpen(false)} />}
    </div>
  );
};

export default App;
