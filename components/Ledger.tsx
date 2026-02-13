
import React, { useState } from 'react';
import { Transaction, TransactionType, AccountType, Category } from '../types';
import { Edit3, Trash2, Search, Calendar, Landmark } from 'lucide-react';

interface LedgerProps {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

const Ledger: React.FC<LedgerProps> = ({ transactions, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');

  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = t.comment.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesAccount = filterAccount === 'all' || t.account === filterAccount;
      return matchesSearch && matchesType && matchesAccount;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getCategoryColor = (cat: Category) => {
    switch (cat) {
      case Category.FOOD: return 'bg-orange-100 text-orange-700';
      case Category.GAMES: return 'bg-purple-100 text-purple-700';
      case Category.SAVINGS: return 'bg-green-100 text-green-700';
      case Category.ALLOWANCE: return 'bg-indigo-100 text-indigo-700';
      case Category.GIFTS: return 'bg-pink-100 text-pink-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none w-full text-sm font-medium"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              className="flex-1 md:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold uppercase tracking-wider"
            >
              <option value="all">Accounts</option>
              <option value={AccountType.CHECKING}>Checking</option>
              <option value={AccountType.SAVINGS}>Savings</option>
            </select>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 md:w-auto px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold uppercase tracking-wider"
            >
              <option value="all">Types</option>
              <option value={TransactionType.DEPOSIT}>Deposits</option>
              <option value={TransactionType.WITHDRAWAL}>Withdrawals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Account</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-500">{t.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${t.account === AccountType.CHECKING ? 'bg-slate-100 text-slate-600' : 'bg-indigo-50 text-indigo-700'}`}>
                      {t.account}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 leading-tight">{t.comment}</span>
                      <span className={`mt-1 inline-flex w-fit px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${getCategoryColor(t.category)}`}>
                        {t.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-base font-black tracking-tight ${t.type === TransactionType.DEPOSIT ? 'text-green-600' : 'text-rose-600'}`}>
                      {t.type === TransactionType.DEPOSIT ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button onClick={() => onEdit(t)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"><Edit3 size={18} /></button>
                      <button onClick={() => onDelete(t.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
          <div key={t.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm active:bg-slate-50 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col">
                <div className="flex items-center space-x-2 mb-1">
                   <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${t.account === AccountType.CHECKING ? 'bg-slate-100 text-slate-500' : 'bg-indigo-100 text-indigo-700'}`}>
                    {t.account}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${getCategoryColor(t.category)}`}>
                    {t.category}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 leading-tight">{t.comment}</h4>
              </div>
              <div className="text-right">
                <p className={`text-lg font-black tracking-tight ${t.type === TransactionType.DEPOSIT ? 'text-green-600' : 'text-rose-600'}`}>
                  {t.type === TransactionType.DEPOSIT ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{t.date}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
              <div className="flex space-x-2">
                <button 
                  onClick={() => onEdit(t)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold uppercase transition active:scale-95 border border-slate-100"
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => onDelete(t.id)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold uppercase transition active:scale-95 border border-rose-100"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
              <div className="p-1.5 bg-slate-50 rounded-lg">
                {t.account === AccountType.SAVINGS ? <Landmark size={16} className="text-indigo-400" /> : <Calendar size={16} className="text-slate-400" />}
              </div>
            </div>
          </div>
        )) : (
          <div className="py-12 text-center">
            <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4">
              <Search size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No matching history</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ledger;
