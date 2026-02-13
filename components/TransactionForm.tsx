
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, AccountType, DEFAULT_CATEGORIES } from '../types';
import { X, Save, AlertCircle, DollarSign, Plus, Check, Landmark, Wallet } from 'lucide-react';

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
    category: 'Other'
  });

  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (!DEFAULT_CATEGORIES.includes(initialData.category)) {
        setIsCustomCategory(true);
        setCustomCategoryName(initialData.category);
      }
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = [];
    if (!formData.amount || formData.amount <= 0) newErrors.push("Enter an amount.");
    if (!formData.comment?.trim()) newErrors.push("Comment is required.");
    
    const finalCategory = isCustomCategory ? customCategoryName.trim() : formData.category;
    if (!finalCategory) newErrors.push("Category is required.");

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
      category: finalCategory as string,
    };

    onSubmit(transaction);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg md:rounded-[2.5rem] rounded-t-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-20 duration-500 md:duration-300 safe-bottom">
        <div className="relative p-6 border-b border-slate-100 flex items-center justify-center bg-white">
          <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-slate-200 rounded-full"></div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mt-4 md:mt-0">
            {initialData ? 'Update Record' : 'Add Transaction'}
          </h3>
          <button 
            onClick={onClose} 
            className="absolute right-6 top-1/2 -translate-y-1/2 p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto hide-scrollbar">
          {errors.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center space-x-3 text-rose-700 text-xs font-bold uppercase tracking-tight">
              <AlertCircle size={18} className="shrink-0" />
              <span>{errors[0]}</span>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">How Much?</label>
            <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-900">
                <DollarSign size={28} strokeWidth={3} />
              </div>
              <input 
                type="number" 
                step="0.01"
                autoFocus={!initialData}
                value={formData.amount || ''}
                onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none text-4xl font-black text-slate-900 transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Account Selection Cards */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Which Account?</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({...formData, account: AccountType.CHECKING})}
                className={`relative flex flex-col items-center p-5 rounded-3xl border-2 transition-all ${
                  formData.account === AccountType.CHECKING 
                  ? 'bg-indigo-50 border-indigo-600 ring-4 ring-indigo-600/20' 
                  : 'bg-white border-slate-100 hover:border-slate-300'
                }`}
              >
                {formData.account === AccountType.CHECKING && (
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-0.5">
                    <Check size={14} strokeWidth={4} />
                  </div>
                )}
                <Wallet className={formData.account === AccountType.CHECKING ? 'text-indigo-600' : 'text-slate-400'} size={24} />
                <span className={`mt-2 font-black text-xs uppercase tracking-wider ${formData.account === AccountType.CHECKING ? 'text-indigo-600' : 'text-slate-400'}`}>
                  Checking
                </span>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({...formData, account: AccountType.SAVINGS})}
                className={`relative flex flex-col items-center p-5 rounded-3xl border-2 transition-all ${
                  formData.account === AccountType.SAVINGS 
                  ? 'bg-indigo-50 border-indigo-600 ring-4 ring-indigo-600/20' 
                  : 'bg-white border-slate-100 hover:border-slate-300'
                }`}
              >
                {formData.account === AccountType.SAVINGS && (
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-0.5">
                    <Check size={14} strokeWidth={4} />
                  </div>
                )}
                <Landmark className={formData.account === AccountType.SAVINGS ? 'text-indigo-600' : 'text-slate-400'} size={24} />
                <span className={`mt-2 font-black text-xs uppercase tracking-wider ${formData.account === AccountType.SAVINGS ? 'text-indigo-600' : 'text-slate-400'}`}>
                  Savings
                </span>
              </button>
            </div>
          </div>

          {/* Type Selection */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button 
              type="button"
              onClick={() => setFormData({...formData, type: TransactionType.DEPOSIT})}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${formData.type === TransactionType.DEPOSIT ? 'bg-white shadow-lg text-green-600 ring-2 ring-green-600/10' : 'text-slate-400'}`}
            >
              Deposit (+)
            </button>
            <button 
              type="button"
              onClick={() => setFormData({...formData, type: TransactionType.WITHDRAWAL})}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${formData.type === TransactionType.WITHDRAWAL ? 'bg-white shadow-lg text-rose-600 ring-2 ring-rose-600/10' : 'text-slate-400'}`}
            >
              Withdraw (-)
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setIsCustomCategory(false); setFormData({...formData, category: cat}); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${!isCustomCategory && formData.category === cat ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-600/15' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'}`}
                >
                  {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustomCategory(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center space-x-1 ${isCustomCategory ? 'bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-600/15' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'}`}
              >
                <Plus size={14} strokeWidth={3} />
                <span>Custom</span>
              </button>
            </div>
            
            {isCustomCategory && (
              <div className="animate-in slide-in-from-top-2 duration-200 mt-2">
                <input 
                  type="text"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  className="w-full px-5 py-4 bg-white border-2 border-indigo-500 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-sm"
                  placeholder="Enter category name..."
                  autoFocus
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Comment</label>
            <input 
              type="text"
              value={formData.comment}
              onChange={(e) => setFormData({...formData, comment: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none font-bold text-sm transition-all"
              placeholder="E.g. Birthday gift, Burger, etc."
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
            className="w-full bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest py-6 rounded-[2rem] flex items-center justify-center space-x-3 shadow-xl shadow-slate-200 transition-all active:scale-95 mt-4"
          >
            <Save size={20} strokeWidth={3} />
            <span>Save Transaction</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
