
import React from 'react';
import { Transaction, TransactionType, AccountType } from '../types';
import { X, Printer, Download } from 'lucide-react';

interface ReportProps {
  transactions: Transaction[];
  balances: { checking: number, savings: number };
  onClose: () => void;
  isPrintView?: boolean;
}

const Report: React.FC<ReportProps> = ({ transactions, balances, onClose, isPrintView = false }) => {
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isPrintView) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center border-b-2 border-slate-900 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Ryan's Money Monitor</h1>
            <p className="text-slate-500 font-bold">Financial Statement - {new Date().toLocaleDateString()}</p>
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
            {sortedTransactions.map(t => (
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

        <div className="mt-12 text-center text-xs text-slate-400">
          Generated via Ryan's Money Monitor App &copy; {new Date().getFullYear()}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md no-print">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
          <div>
            <h3 className="text-xl font-black text-slate-900">Financial Report</h3>
            <p className="text-sm text-slate-500">Preview of your printable statement</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => window.print()} 
              className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center space-x-2"
            >
              <Printer size={18} />
              <span>Print Statement</span>
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 bg-slate-50">
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 mx-auto max-w-4xl min-h-full">
             {/* Use same content as print view for preview */}
             <div className="flex justify-between items-center border-b-2 border-slate-900 pb-6 mb-8">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Ryan's Money Monitor</h1>
                <p className="text-slate-500 font-bold">Financial Statement - {new Date().toLocaleDateString()}</p>
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
                <tr className="bg-slate-50">
                  <th className="p-3 text-left border-b text-xs font-bold uppercase text-slate-400">Date</th>
                  <th className="p-3 text-left border-b text-xs font-bold uppercase text-slate-400">Account</th>
                  <th className="p-3 text-left border-b text-xs font-bold uppercase text-slate-400">Category</th>
                  <th className="p-3 text-left border-b text-xs font-bold uppercase text-slate-400">Comment</th>
                  <th className="p-3 text-right border-b text-xs font-bold uppercase text-slate-400">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedTransactions.map(t => (
                  <tr key={t.id}>
                    <td className="p-3 text-sm text-slate-600">{t.date}</td>
                    <td className="p-3 text-sm font-bold">{t.account}</td>
                    <td className="p-3 text-sm text-slate-500 uppercase font-bold text-[10px]">{t.category}</td>
                    <td className="p-3 text-sm text-slate-700 italic">{t.comment}</td>
                    <td className={`p-3 text-sm font-black text-right ${t.type === TransactionType.DEPOSIT ? 'text-green-600' : 'text-rose-600'}`}>
                      {t.type === TransactionType.DEPOSIT ? '+' : '-'} ${t.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
