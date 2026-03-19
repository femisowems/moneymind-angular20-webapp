"use client";

import { useStore } from "@/store/useStore";
import { useEffect, useState } from "react";
import { Zap, Share2 } from "lucide-react";
import { ShareScorecardModal } from "./ShareScorecardModal";

export function PlayerLevelBar() {
  const { score } = useStore();
  const [mounted, setMounted] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) return null;

  const currentLevelXP = (score.level - 1) * 100;
  const xpIntoLevel = score.xp - currentLevelXP;
  // Fallback calculation using 100 since nextLevelXP - currentLevelXP is always 100 in our formula
  const progressPercent = Math.min((xpIntoLevel / 100) * 100, 100);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-5 sm:gap-6 w-full cursor-default group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500">
      {/* Top Section: Level Badge & Share Button (Mobile) / Left Section (Desktop) */}
      <div className="flex items-center justify-between sm:justify-start gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-black text-2xl shadow-lg border-4 border-white transform group-hover:scale-105 transition-transform duration-500">
            {score.level}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-gray-900 tracking-tight leading-tight">Level {score.level}</span>
            <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5 mt-0.5">
              <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {score.xp} Total XP
            </span>
          </div>
        </div>

        {/* Share Button (Mobile Only inline) */}
        <button 
          onClick={() => setIsShareOpen(true)}
          className="sm:hidden bg-gray-50 hover:bg-primary/10 text-gray-500 hover:text-primary p-3 rounded-2xl transition-all border border-gray-100 flex items-center justify-center"
          title="Share Scorecard"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Section: Full width on mobile, flexible on desktop */}
      <div className="flex-1 flex flex-col gap-2.5">
        <div className="flex justify-between items-end px-0.5">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-0.5">Progress</span>
            <span className="text-xs font-bold text-gray-700">{xpIntoLevel} <span className="text-gray-400">/ 100 XP</span></span>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.15em] mb-0.5">Next Level</span>
            <span className="text-xs font-bold text-primary">{100 - xpIntoLevel} XP to go</span>
          </div>
        </div>
        <div className="w-full h-3.5 bg-gray-100/80 rounded-full overflow-hidden shadow-inner relative border border-gray-50">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-primary-hover to-[#7050ff] rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(109,80,245,0.3)]" 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
      </div>
      
      {/* Desktop Share Button */}
      <button 
        onClick={() => setIsShareOpen(true)}
        className="hidden sm:flex bg-gradient-to-br from-gray-50 to-white hover:from-primary/10 hover:to-primary/5 text-gray-600 hover:text-primary font-bold px-4 py-3 rounded-2xl transition-all shadow-sm border border-gray-200 hover:border-primary/20 flex-col items-center justify-center shrink-0 min-w-[72px]"
        title="Share Scorecard"
      >
        <Share2 className="w-5 h-5 mb-1" />
        <span className="text-[10px] uppercase tracking-widest font-black">Share</span>
      </button>

      <ShareScorecardModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </div>
  );
}
