
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, AccountType, TransactionType, ChartDataPoint } from '../types';
import { Sparkles, RefreshCw } from 'lucide-react';

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

    let runningBalance = 0;
    const data: ChartDataPoint[] = [];

    // Group by date to show daily totals
    const dailyMap = new Map<string, number>();
    savingsTransactions.forEach(t => {
      const amount = t.type === TransactionType.DEPOSIT ? t.amount : -t.amount;
      dailyMap.set(t.date, (dailyMap.get(t.date) || 0) + amount);
    });

    const sortedDates = Array.from(dailyMap.keys()).sort();
    sortedDates.forEach(date => {
      runningBalance += dailyMap.get(date)!;
      data.push({ date, balance: runningBalance });
    });

    return data;
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Chart Section */}
      <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">Savings Growth</h3>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">Visual Progress</span>
        </div>
        
        <div className="h-[300px] w-full">
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Savings Balance']}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorBalance)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
              <TrendingUp size={48} className="mb-2 opacity-20" />
              <p>Add more savings transactions to see your growth!</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights Sidebar */}
      <div className="bg-indigo-50 p-6 md:p-8 rounded-3xl border border-indigo-100 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-indigo-600" size={20} />
            <h3 className="text-xl font-bold text-indigo-900">AI Coach</h3>
          </div>
          <button 
            onClick={onRefreshInsight} 
            disabled={isLoadingInsight || transactions.length === 0}
            className="p-2 hover:bg-white rounded-full transition text-indigo-600 disabled:opacity-30"
            title="Get new insights"
          >
            <RefreshCw size={18} className={isLoadingInsight ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex-1 space-y-4">
          {aiInsight ? (
            <div className="prose prose-indigo text-indigo-900/80 leading-relaxed whitespace-pre-line">
              {aiInsight}
            </div>
          ) : (
            <div className="text-center py-10 text-indigo-300">
              <p className="mb-4">Need some advice?</p>
              <button 
                onClick={onRefreshInsight}
                disabled={transactions.length === 0}
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 disabled:bg-slate-300 transition"
              >
                Get Insights
              </button>
              {transactions.length === 0 && <p className="text-xs mt-4">Add transactions first!</p>}
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Ryan's Savings Goal</p>
          <div className="flex justify-between items-end">
            <span className="text-xl font-black text-indigo-900">${balances.savings.toLocaleString()}</span>
            <span className="text-xs text-indigo-400">Total in Savings</span>
          </div>
          <div className="w-full bg-indigo-50 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-600 h-full transition-all" style={{width: `${Math.min((balances.savings / 500) * 100, 100)}%`}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TrendingUp: React.FC<{size?: number, className?: string}> = ({size = 24, className}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

export default Dashboard;
