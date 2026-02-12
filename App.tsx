
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, LayoutDashboard, History, FileText, TrendingUp, Edit3, Trash2, Printer, Sparkles, X } from 'lucide-react';
import { Transaction, AccountType, TransactionType, Category } from './types';
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

  useEffect(() => {
    localStorage.setItem('ryan-money-monitor-data', JSON.stringify(transactions));
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
    if (window.confirm('Are you sure you want to delete this transaction?')) {
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* Sidebar - Desktop */}
      <aside className="no-print w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col space-y-8 sticky top-0 h-auto md:h-screen">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-indigo-500 rounded-lg">
            <TrendingUp size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Money Monitor</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${activeTab === 'dashboard' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${activeTab === 'ledger' ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}
          >
            <History size={20} />
            <span className="font-medium">Transaction History</span>
          </button>
        </nav>

        <div className="space-y-3 pt-4 border-t border-slate-800">
          <button 
            onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }}
            className="w-full bg-white text-indigo-600 hover:bg-slate-100 font-bold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-95"
          >
            <Plus size={20} />
            <span>Add Transaction</span>
          </button>
          <button 
            onClick={() => setIsReportOpen(true)}
            className="w-full bg-slate-800 text-white hover:bg-slate-700 font-medium py-3 rounded-xl flex items-center justify-center space-x-2 transition"
          >
            <FileText size={20} />
            <span>Generate Report</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full no-print">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Hey, Ryan! 👋</h2>
            <p className="text-slate-500 mt-1">Here's a look at your personal bank.</p>
          </div>
          <div className="flex space-x-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex-1 md:flex-none">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Checking</p>
              <p className={`text-2xl font-black ${balances.checking >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                ${balances.checking.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-indigo-600 p-4 rounded-2xl shadow-sm border border-indigo-700 flex-1 md:flex-none text-white">
              <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Savings</p>
              <p className="text-2xl font-black">
                ${balances.savings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <Dashboard 
            transactions={transactions} 
            balances={balances} 
            aiInsight={aiInsight}
            onRefreshInsight={fetchInsights}
            isLoadingInsight={isLoadingInsight}
          />
        ) : (
          <Ledger 
            transactions={transactions} 
            onEdit={handleEditRequest} 
            onDelete={handleDeleteTransaction}
          />
        )}
      </main>

      {/* Modals */}
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

      {/* Printable Area - only visible when printing */}
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
