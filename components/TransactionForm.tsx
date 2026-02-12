
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, AccountType, Category } from '../types';
import { X, Save, AlertCircle } from 'lucide-react';

interface TransactionFormProps {
  onClose: () => void;
  onSubmit: (t: Transaction) => void;
  initialData: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    type: TransactionType.DEPOSIT,
    account: AccountType.CHECKING,
    comment: '',
    category: Category.OTHER
  });

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = [];
    if (!formData.amount || formData.amount <= 0) newErrors.push("Please enter an amount greater than zero.");
    if (!formData.comment?.trim()) newErrors.push("Please add a comment about this transaction.");
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const transaction: Transaction = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      date: formData.date as string,
      amount: Number(formData.amount),
      type: formData.type as TransactionType,
      account: formData.account as AccountType,
      comment: (formData.comment as string).trim(),
      category: formData.category as Category,
    };

    onSubmit(transaction);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-xl font-black text-slate-900">
            {initialData ? 'Edit Transaction' : 'New Transaction'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start space-x-3 text-rose-700 text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <ul className="list-disc list-inside">
                {errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account</label>
              <select 
                value={formData.account}
                onChange={(e) => setFormData({...formData, account: e.target.value as AccountType})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              >
                <option value={AccountType.CHECKING}>Checking</option>
                <option value={AccountType.SAVINGS}>Savings</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Type</label>
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: TransactionType.DEPOSIT})}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${formData.type === TransactionType.DEPOSIT ? 'bg-white shadow text-green-600' : 'text-slate-400'}`}
                >
                  Deposit
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: TransactionType.WITHDRAWAL})}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${formData.type === TransactionType.WITHDRAWAL ? 'bg-white shadow text-rose-600' : 'text-slate-400'}`}
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input 
                type="number" 
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xl font-black text-slate-900"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
            >
              {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Comment (Mandatory)</label>
            <textarea 
              value={formData.comment}
              onChange={(e) => setFormData({...formData, comment: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium min-h-[100px]"
              placeholder="What was this for?"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</label>
            <input 
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-xl shadow-indigo-200 transition active:scale-95"
          >
            <Save size={20} />
            <span>{initialData ? 'Update Record' : 'Save Transaction'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
