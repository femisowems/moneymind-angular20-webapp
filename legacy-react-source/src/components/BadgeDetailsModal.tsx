"use client";

import { Modal } from "./ui/Modal";
import { Achievement } from "@/lib/achievements";
import { useStore } from "@/store/useStore";
import { Zap, CheckCircle2, Lock } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  achievement: Achievement;
}

export function BadgeDetailsModal({ isOpen, onClose, achievement }: Props) {
  const storeState = useStore();
  const isUnlocked = storeState.unlockedAchievements.includes(achievement.id);
  
  const progress = achievement.getProgress ? achievement.getProgress(storeState) : (isUnlocked ? (achievement.maxProgress || 1) : 0);
  const max = achievement.maxProgress || 1;
  const percent = Math.min((progress / max) * 100, 100);

  const getTierBadge = (tier: Achievement['tier']) => {
    switch (tier) {
      case 'platinum': return <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-200">Platinum</span>;
      case 'gold': return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-200">Gold</span>;
      case 'silver': return <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest border border-slate-300">Silver</span>;
      default: return <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest border border-orange-200">Bronze</span>;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Achievement Details">
      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-3xl border border-gray-100 relative overflow-hidden mb-6">
        {isUnlocked && achievement.tier === 'platinum' && (
           <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full" />
        )}
        <div className={`w-28 h-28 rounded-full flex items-center justify-center text-6xl shadow-xl relative z-10 ${isUnlocked ? 'bg-white filter-none' : 'bg-gray-200 grayscale opacity-60'}`}>
           <span className="drop-shadow-lg">{achievement.icon}</span>
        </div>
        <div className="absolute top-4 right-4 z-10 flex gap-2">
           {getTierBadge(achievement.tier)}
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-2xl font-black text-gray-900 mb-2 flex items-center justify-center gap-2">
          {achievement.title}
          {isUnlocked ? <CheckCircle2 className="w-5 h-5 text-success" /> : <Lock className="w-5 h-5 text-gray-400" />}
        </h3>
        <p className="text-md font-medium text-gray-600 mb-4 px-4">{achievement.description}</p>
        
        <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold">
          <Zap className="w-4 h-4" fill="currentColor" />
          +50 XP Reward
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Progress</span>
          <span className="text-sm font-black text-gray-900">{progress} / {max}</span>
        </div>
        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${isUnlocked ? 'bg-success' : 'bg-gradient-to-r from-primary to-[#7050ff]'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </Modal>
  );
}
