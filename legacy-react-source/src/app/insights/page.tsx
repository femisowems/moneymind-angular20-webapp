"use client";

import { useStore } from "@/store/useStore";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, PieChart as PieIcon, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, isSameMonth } from "date-fns";

export default function InsightsPage() {
  const { reminders, categories } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const { categoryData, monthlyData, totalManaged, completedCount } = useMemo(() => {
    let total = 0;
    let completed = 0;
    
    // Category Breakdown (Only counting mapped amounts)
    const catMap: Record<string, number> = {};
    categories.forEach(c => catMap[c.name] = 0);
    
    // Monthly Splitting
    const monthMap: Record<string, number> = {};

    reminders.forEach(r => {
      if (r.amount) {
        total += r.amount;
        if (r.isCompleted) completed += 1;

        // Category Math
        const cat = categories.find(c => c.id === r.category);
        if (cat) catMap[cat.name] += r.amount;
        else catMap['Other'] = (catMap['Other'] || 0) + r.amount;

        // Monthly Math
        const monthKey = format(new Date(r.dueDate), "MMM yyyy");
        monthMap[monthKey] = (monthMap[monthKey] || 0) + r.amount;
      }
    });

    const parsedCategoryData = Object.keys(catMap)
      .filter(k => catMap[k] > 0)
      .map((k, i) => ({
        name: k,
        value: catMap[k],
        color: ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'][i % 5]
      }));

    const parsedMonthlyData = Object.keys(monthMap)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map(k => ({ name: k, amount: monthMap[k] }));

    return { 
      categoryData: parsedCategoryData, 
      monthlyData: parsedMonthlyData, 
      totalManaged: total,
      completedCount: completed 
    };
  }, [reminders, categories]);

  if (!mounted) return null;

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-6 pb-24">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2.5 bg-gray-50 border border-gray-100 hover:bg-gray-200 rounded-xl transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" /> Spending Insights
            </h1>
            <p className="text-gray-500 text-sm font-medium">Your financial breakdown at a glance.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Activity className="w-4 h-4" /> Total Managed
          </span>
          <span className="text-4xl font-black text-gray-900">${totalManaged.toLocaleString()}</span>
        </div>
        
        <div className="md:col-span-2 bg-gradient-to-br from-primary to-[#7050ff] p-6 rounded-3xl text-white shadow-lg relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-12 translate-x-12" />
          <span className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1 relative z-10">Task Completion Rate</span>
          <span className="text-4xl font-black relative z-10">{reminders.length > 0 ? Math.round((completedCount / reminders.length) * 100) : 0}%</span>
          <p className="text-white/80 text-sm font-medium mt-1 relative z-10 w-3/4">You are {completedCount} for {reminders.length} on tackling your financial responsibilities!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-80 flex flex-col">
          <span className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-1.5">
            <PieIcon className="w-4 h-4 text-primary" /> Spending by Category
          </span>
          {categoryData.length > 0 ? (
            <div className="flex-1 w-full min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => `$${Number(value).toLocaleString()}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total</span>
                <span className="text-lg font-black">${totalManaged.toLocaleString()}</span>
              </div>
            </div>
          ) : (
             <div className="flex-1 flex items-center justify-center text-gray-400 text-sm font-medium">No amounts recorded yet.</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-80 flex flex-col">
          <span className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-primary" /> Monthly Breakdown
          </span>
          {monthlyData.length > 0 ? (
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af', fontWeight: 600 }} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Amount"]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="amount" fill="#6d50f5" radius={[6, 6, 6, 6]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm font-medium">No amounts recorded yet.</div>
          )}
        </div>
      </div>
    </main>
  );
}
