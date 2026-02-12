
import React, { useState } from 'react';
import { Transaction, TransactionType, AccountType, Category } from '../types';
import { Edit3, Trash2, Search, Filter } from 'lucide-react';

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
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-slate-800">Transaction History</h3>
        
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search comments..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
            />
          </div>
          <select 
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
          >
            <option value="all">All Accounts</option>
            <option value={AccountType.CHECKING}>Checking</option>
            <option value={AccountType.SAVINGS}>Savings</option>
          </select>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
          >
            <option value="all">All Types</option>
            <option value={TransactionType.DEPOSIT}>Deposits</option>
            <option value={TransactionType.WITHDRAWAL}>Withdrawals</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Account</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Details</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{t.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${t.account === AccountType.CHECKING ? 'bg-slate-100 text-slate-600' : 'bg-indigo-100 text-indigo-700'}`}>
                    {t.account}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{t.comment}</span>
                    <span className={`mt-1 inline-flex w-fit px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${getCategoryColor(t.category)}`}>
                      {t.category}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-black ${t.type === TransactionType.DEPOSIT ? 'text-green-600' : 'text-rose-600'}`}>
                    {t.type === TransactionType.DEPOSIT ? '+' : '-'} ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(t)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete(t.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No transactions found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ledger;
