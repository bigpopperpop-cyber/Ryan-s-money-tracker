
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, AccountType, Category } from '../types';
import { X, Save, AlertCircle, DollarSign } from 'lucide-react';

interface TransactionFormProps {
  onClose: () => void;
  onSubmit: (t: Transaction) => void;
  initialData: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<Transaction>>({
    date: new Date().toISOString().split('T')[0],
    amount: undefined,
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
    if (!formData.amount || formData.amount <= 0) newErrors.push("Enter an amount.");
    if (!formData.comment?.trim()) newErrors.push("Comment is required.");
    
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
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-0 md:p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg md:rounded-3xl rounded-t-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-20 duration-500 md:duration-200 safe-bottom">
        <div className="relative p-6 border-b border-slate-100 flex items-center justify-center bg-white">
          <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full mb-4"></div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mt-2 md:mt-0">
            {initialData ? 'Update Record' : 'Log Money'}
          </h3>
          <button 
            onClick={onClose} 
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
          {errors.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center space-x-3 text-rose-700 text-xs font-bold uppercase tracking-tight">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errors[0]}</span>
            </div>
          )}

          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button 
              type="button"
              onClick={() => setFormData({...formData, type: TransactionType.DEPOSIT})}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${formData.type === TransactionType.DEPOSIT ? 'bg-white shadow-lg text-green-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Deposit
            </button>
            <button 
              type="button"
              onClick={() => setFormData({...formData, type: TransactionType.WITHDRAWAL})}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${formData.type === TransactionType.WITHDRAWAL ? 'bg-white shadow-lg text-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Withdraw
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Amount</label>
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-900 transition-colors">
                <DollarSign size={24} strokeWidth={3} />
              </div>
              <input 
                type="number" 
                step="0.01"
                autoFocus={!initialData}
                value={formData.amount || ''}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[24px] focus:border-indigo-500 focus:bg-white outline-none text-3xl font-black text-slate-900 transition-all placeholder:text-slate-200"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Account</label>
              <select 
                value={formData.account}
                onChange={(e) => setFormData({...formData, account: e.target.value as AccountType})}
                className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-sm transition-all appearance-none cursor-pointer"
              >
                <option value={AccountType.CHECKING}>Checking</option>
                <option value={AccountType.SAVINGS}>Savings</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
                className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-sm transition-all appearance-none cursor-pointer"
              >
                {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Comment</label>
            <input 
              type="text"
              value={formData.comment}
              onChange={(e) => setFormData({...formData, comment: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-sm transition-all placeholder:font-normal placeholder:text-slate-300"
              placeholder="Ex: Birthday money or Lunch"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Date</label>
            <input 
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-sm transition-all"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center space-x-3 shadow-xl shadow-slate-200 transition-all active:scale-95 mt-4"
          >
            <Save size={20} strokeWidth={3} />
            <span>Confirm Record</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
