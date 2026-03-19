"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";
import { Target, Plus, X, DollarSign, Trash2 } from "lucide-react";
import { Goal } from "@/types";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

export function GoalsSection() {
  const { goals, addGoal, addFundsToGoal, deleteGoal } = useStore();
  const [mounted, setMounted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  
  // New goal state
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  
  // Add funds state
  const [fundAmount, setFundAmount] = useState("");

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) return;
    addGoal({
      title,
      targetAmount: Number(targetAmount),
      currentAmount: 0,
      icon: '🎯'
    });
    setIsAdding(false);
    setTitle("");
    setTargetAmount("");
  };

  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoal || !fundAmount) return;
    addFundsToGoal(activeGoal.id, Number(fundAmount));
    setActiveGoal(null);
    setFundAmount("");
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
          <Target className="w-4 h-4" /> Long-Term Goals
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {goals.map(goal => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const isComplete = progress === 100;
          
          return (
            <div 
              key={goal.id} 
              onClick={() => setActiveGoal(goal)}
              className={`snap-center shrink-0 w-64 p-4 rounded-3xl border transition-all cursor-pointer relative group ${isComplete ? 'bg-success/5 border-success/20 shadow-sm' : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20'}`}
            >
              <button 
                onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-sm text-gray-400 hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl ${isComplete ? 'bg-success/10' : 'bg-primary/10'}`}>
                  {goal.icon || '🎯'}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 truncate max-w-[140px]">{goal.title}</span>
                  <span className="text-xs font-semibold text-gray-500">
                    ${goal.currentAmount.toLocaleString()} / <span className="text-gray-400">${goal.targetAmount.toLocaleString()}</span>
                  </span>
                </div>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${isComplete ? 'bg-success' : 'bg-gradient-to-r from-primary to-[#7050ff]'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase text-right tracking-wider">
                {Math.round(progress)}% {isComplete ? 'Completed!' : ''}
              </p>
            </div>
          );
        })}

        {!isAdding ? (
          <button 
            onClick={() => setIsAdding(true)}
            className="snap-center shrink-0 w-32 h-[126px] p-4 rounded-3xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
          >
            <Plus className="w-6 h-6 mb-1" />
            <span className="text-xs font-bold uppercase tracking-wider">Add Goal</span>
          </button>
        ) : (
          <form onSubmit={handleAddGoal} className="snap-center shrink-0 w-64 p-4 rounded-3xl border border-primary/20 bg-white shadow-sm flex flex-col gap-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">New Goal</span>
              <button type="button" onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
            <Input autoFocus placeholder="Goal Title (e.g. Vacation)" value={title} onChange={(e) => setTitle(e.target.value)} required className="h-8 text-sm px-2" />
            <Input type="number" placeholder="Target Amount" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required min={1} className="h-8 text-sm px-2" />
            <Button type="submit" size="sm" className="w-full mt-1">Create</Button>
          </form>
        )}
      </div>

      {activeGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <form onSubmit={handleAddFunds} className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-xl">{activeGoal.icon}</div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-lg text-gray-900 leading-tight">{activeGoal.title}</h3>
                  <span className="text-xs font-semibold text-gray-500">
                    ${activeGoal.currentAmount.toLocaleString()} of ${activeGoal.targetAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => setActiveGoal(null)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input 
                autoFocus 
                type="number" 
                placeholder="Amount to deposit" 
                value={fundAmount} 
                onChange={(e) => setFundAmount(e.target.value)} 
                required 
                min={1} 
                className="pl-10 text-lg py-6 shadow-none"
              />
            </div>
            
            <Button type="submit" className="w-full py-6 text-base shadow-lg shadow-primary/20 group">
              Deposit Funds
            </Button>
          </form>
        </div>
      )}
    </section>
  );
}
