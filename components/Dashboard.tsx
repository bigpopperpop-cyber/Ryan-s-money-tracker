import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, AccountType, TransactionType, ChartDataPoint } from '../types';
import { Sparkles, RefreshCw, ArrowUpRight } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  balances: { checking: number, savings: number };
  aiInsight: string;
  onRefreshInsight: () => void;
  isLoadingInsight: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, balances, aiInsight, onRefreshInsight, isLoadingInsight }) => {
  const chartData = useMemo(() => {
    const savingsTransactions = transactions
      .filter(t => t.account === AccountType.SAVINGS)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (savingsTransactions.length === 0) return [];

    let runningBalance = 0;
    const data: ChartDataPoint[] = [];

    const dailyMap = new Map<string, number>();
    savingsTransactions.forEach(t => {
      const amount = t.type === TransactionType.DEPOSIT ? t.amount : -t.amount;
      dailyMap.set(t.date, (dailyMap.get(t.date) || 0) + amount);
    });

    const sortedDates = Array.from(dailyMap.keys()).sort();
    
    if (sortedDates.length === 1) {
      const firstDate = new Date(sortedDates[0]);
      const prevDate = new Date(firstDate);
      prevDate.setDate(firstDate.getDate() - 1);
      data.push({ 
        date: prevDate.toISOString().split('T')[0], 
        balance: 0 
      });
    }

    sortedDates.forEach(date => {
      runningBalance += dailyMap.get(date)!;
      data.push({ date, balance: runningBalance });
    });

    return data;
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Visual Progress Card */}
      <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Performance</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Savings Growth</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-2xl">
            <ArrowUpRight size={20} className="text-indigo-600" />
          </div>
        </div>
        
        <div className="h-[280px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#cbd5e1', fontSize: 10, fontWeight: 700}}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#cbd5e1', fontSize: 10, fontWeight: 700}}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '24px', 
                    border: 'none', 
                    padding: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: 800
                  }}
                  itemStyle={{ color: '#4f46e5' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Balance']}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#4f46e5" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorBalance)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2rem]">
              <p className="font-black text-sm uppercase tracking-widest opacity-40">Awaiting Data</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Intelligence Section */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] flex flex-col justify-between text-white shadow-2xl shadow-slate-900/20">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Sparkles size={16} fill="white" />
              </div>
              <h3 className="text-lg font-black tracking-tight uppercase">AI Coach</h3>
            </div>
            <button 
              onClick={onRefreshInsight} 
              disabled={isLoadingInsight || transactions.length === 0}
              className={`p-2.5 rounded-full transition-all ${isLoadingInsight ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700'} disabled:opacity-20`}
            >
              <RefreshCw size={18} className={isLoadingInsight ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="min-h-[160px] relative">
            {aiInsight ? (
              <div className="text-sm font-medium leading-relaxed text-slate-300 bg-slate-800/50 p-6 rounded-3xl border border-white/5">
                {aiInsight}
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <p className="text-slate-500 text-sm font-bold">Needs your activity data to provide advice.</p>
                <button 
                  onClick={onRefreshInsight}
                  disabled={transactions.length === 0}
                  className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg transition active:scale-95 disabled:bg-slate-800 disabled:text-slate-600"
                >
                  Generate Insights
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800">
           <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Savings Progress</p>
              <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-md uppercase">Level 1</span>
           </div>
           <div className="flex justify-between items-end mb-3">
              <span className="text-2xl font-black">${balances.savings.toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-500">Goal: $1,000</span>
           </div>
           <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                style={{ width: `${Math.min((balances.savings / 1000) * 100, 100)}%` }}
              ></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;