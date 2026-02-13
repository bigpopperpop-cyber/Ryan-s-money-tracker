
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, AccountType } from '../types';
import { X, Printer, Calendar, ChevronDown, Filter } from 'lucide-react';

interface ReportProps {
  transactions: Transaction[];
  balances: { checking: number, savings: number };
  onClose: () => void;
  isPrintView?: boolean;
}

type TimeframeOption = 'all' | '7days' | '30days' | 'thisMonth' | 'custom';

const Report: React.FC<ReportProps> = ({ transactions, balances, onClose, isPrintView = false }) => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startLimit: Date | null = null;
    let endLimit: Date | null = null;

    if (timeframe === '7days') {
      startLimit = new Date();
      startLimit.setDate(now.getDate() - 7);
    } else if (timeframe === '30days') {
      startLimit = new Date();
      startLimit.setDate(now.getDate() - 30);
    } else if (timeframe === 'thisMonth') {
      startLimit = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeframe === 'custom') {
      if (startDate) startLimit = new Date(startDate);
      if (endDate) endLimit = new Date(endDate);
    }

    return transactions
      .filter(t => {
        const tDate = new Date(t.date);
        if (startLimit && tDate < startLimit) return false;
        if (endLimit && tDate > endLimit) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, timeframe, startDate, endDate]);

  const timeframeLabel = useMemo(() => {
    switch (timeframe) {
      case '7days': return 'Last 7 Days';
      case '30days': return 'Last 30 Days';
      case 'thisMonth': return 'This Month';
      case 'custom': return `From ${startDate || '...'} to ${endDate || '...'}`;
      default: return 'Full History';
    }
  }, [timeframe, startDate, endDate]);

  if (isPrintView) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center border-b-2 border-slate-900 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Ryan's Money Monitor</h1>
            <p className="text-slate-500 font-bold">Statement: {timeframeLabel}</p>
            <p className="text-[10px] font-black uppercase text-slate-400 mt-1">Generated on {new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <div className="mb-1">
              <span className="text-xs font-bold text-slate-400 uppercase mr-4">Checking Balance</span>
              <span className="text-xl font-bold">${balances.checking.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase mr-4">Savings Balance</span>
              <span className="text-xl font-bold text-indigo-600">${balances.savings.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-3 text-left border text-xs font-bold uppercase">Date</th>
              <th className="p-3 text-left border text-xs font-bold uppercase">Account</th>
              <th className="p-3 text-left border text-xs font-bold uppercase">Category</th>
              <th className="p-3 text-left border text-xs font-bold uppercase">Comment</th>
              <th className="p-3 text-right border text-xs font-bold uppercase">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(t => (
              <tr key={t.id}>
                <td className="p-3 border text-sm">{t.date}</td>
                <td className="p-3 border text-sm">{t.account}</td>
                <td className="p-3 border text-sm">{t.category}</td>
                <td className="p-3 border text-sm italic">{t.comment}</td>
                <td className={`p-3 border text-sm font-bold text-right ${t.type === TransactionType.DEPOSIT ? 'text-green-600' : 'text-rose-600'}`}>
                  {t.type === TransactionType.DEPOSIT ? '+' : '-'} ${t.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTransactions.length === 0 && (
          <div className="p-10 text-center text-slate-400 italic">No transactions found for this period.</div>
        )}

        <div className="mt-12 text-center text-xs text-slate-400">
          Generated via Ryan's Money Monitor App &copy; {new Date().getFullYear()}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-6 bg-slate-900/90 backdrop-blur-lg no-print animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-6xl h-full md:h-[92vh] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between bg-white gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Statement Builder</h3>
            <p className="text-sm font-medium text-slate-500">Pick a timeframe and review before printing</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => window.print()} 
              className="flex-1 md:flex-none px-8 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition active:scale-95 flex items-center justify-center space-x-3"
            >
              <Printer size={20} strokeWidth={3} />
              <span>Print Statement</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-slate-50 p-6 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
             <div className="flex items-center space-x-3 shrink-0">
               <div className="p-2 bg-white rounded-lg border border-slate-200">
                 <Filter size={18} className="text-indigo-600" />
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Period:</span>
             </div>
             
             <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All History' },
                  { id: '7days', label: 'Last 7 Days' },
                  { id: '30days', label: 'Last 30 Days' },
                  { id: 'thisMonth', label: 'This Month' },
                  { id: 'custom', label: 'Custom Range' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTimeframe(opt.id as TimeframeOption)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                      timeframe === opt.id 
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                      : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
             </div>

             {timeframe === 'custom' && (
               <div className="flex items-center space-x-3 animate-in slide-in-from-left-4 duration-300">
                 <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                 />
                 <span className="text-slate-400 font-bold">to</span>
                 <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                 />
               </div>
             )}
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-slate-100/50 flex justify-center scroll-smooth hide-scrollbar">
          <div className="bg-white p-8 md:p-16 rounded-[2.5rem] shadow-sm border border-slate-200 w-full max-w-4xl h-fit min-h-[11in] transition-all">
             
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-slate-900 pb-10 mb-12 gap-8">
              <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">Ryan's Money Monitor</h1>
                <div className="mt-4 flex flex-col space-y-1">
                  <p className="text-slate-500 font-black text-xs uppercase tracking-widest">{timeframeLabel}</p>
                  <p className="text-indigo-600 font-bold text-sm">Financial Summary Report</p>
                </div>
              </div>
              <div className="text-left md:text-right space-y-4">
                <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 inline-block md:block">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Checking Balance</p>
                  <p className="text-2xl font-black text-slate-900">${balances.checking.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-indigo-600 px-6 py-4 rounded-2xl shadow-xl shadow-indigo-100 inline-block md:block">
                  <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-1">Savings Balance</p>
                  <p className="text-2xl font-black text-white">${balances.savings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="py-4 px-2 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                    <th className="py-4 px-2 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Account</th>
                    <th className="py-4 px-2 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Comment</th>
                    <th className="py-4 px-2 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTransactions.map(t => (
                    <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-2 text-sm text-slate-500 font-medium">{t.date}</td>
                      <td className="py-5 px-2">
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${t.account === AccountType.CHECKING ? 'bg-slate-100 text-slate-600' : 'bg-indigo-50 text-indigo-600'}`}>
                          {t.account}
                        </span>
                      </td>
                      <td className="py-5 px-2">
                        <p className="text-sm font-bold text-slate-900">{t.comment}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{t.category}</p>
                      </td>
                      <td className={`py-5 px-2 text-base font-black text-right ${t.type === TransactionType.DEPOSIT ? 'text-green-600' : 'text-rose-600'}`}>
                        {t.type === TransactionType.DEPOSIT ? '+' : '-'} ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="py-32 flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-6 bg-slate-50 rounded-full">
                  <Calendar size={48} className="text-slate-200" />
                </div>
                <div>
                  <p className="text-slate-900 font-black uppercase text-xs tracking-[0.2em]">No records in this timeframe</p>
                  <p className="text-slate-400 text-sm mt-1">Try selecting a different period above.</p>
                </div>
              </div>
            )}

            <div className="mt-20 pt-10 border-t border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">End of Official Statement</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
