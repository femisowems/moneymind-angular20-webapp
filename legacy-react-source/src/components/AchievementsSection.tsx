"use client";

import { useStore } from "@/store/useStore";
import { ACHIEVEMENTS, Achievement } from "@/lib/achievements";
import { Trophy } from "lucide-react";
import { BadgeDetailsModal } from "./BadgeDetailsModal";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AchievementsSection() {
  const storeState = useStore();
  const { unlockedAchievements } = storeState;
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
 
  const getTierColors = (tier: Achievement['tier'], isUnlocked: boolean) => {
    if (!isUnlocked) return "bg-gray-50 border-gray-100 text-gray-300 opacity-60 grayscale";
    switch (tier) {
      case 'platinum': return "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-indigo-100/50 shimmer text-gray-500 shadow-sm border border-gray-100";
      case 'gold': return "bg-amber-50 border-amber-200 text-amber-700 shadow-amber-100/50 text-gray-500 shadow-sm border border-gray-100";
      case 'silver': return "bg-slate-50 border-slate-300 text-slate-700 shadow-slate-200/50 text-gray-500 shadow-sm border border-gray-100";
      case 'bronze': return "bg-orange-50 border-orange-200 text-orange-800 shadow-orange-100/50 text-gray-500 shadow-sm border border-gray-100";
      default: return "bg-emerald-50 border-emerald-100 text-emerald-600 shadow-emerald-100/50 text-gray-500 shadow-sm border border-gray-100";
    }
  };
 
  const visibleAchievements = ACHIEVEMENTS.filter(a => 
    !a.isHidden || (a.isHidden && unlockedAchievements.includes(a.id))
  );

  const displayedAchievements = isExpanded ? visibleAchievements : visibleAchievements.slice(0, 4);
 
  return (
    <>
      <section className="mb-10">
        <div className="flex justify-between items-center mb-6 px-1">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2.5">
            <Trophy className="w-4 h-4 text-primary" /> Badges & Achievements
          </h2>
          
          {visibleAchievements.length > 4 && (
            <motion.button 
              layout
              onClick={() => setIsExpanded(!isExpanded)}
              className="relative overflow-hidden text-xs font-bold text-primary transition-all flex items-center gap-2 group bg-white border border-gray-100 hover:border-primary/30 px-4 py-2 rounded-full shadow-sm hover:shadow-md active:scale-95"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={isExpanded ? 'less' : 'more'}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="inline-block"
                >
                  {isExpanded ? 'Show less' : `+${visibleAchievements.length - 4} more`}
                </motion.span>
              </AnimatePresence>
              
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center justify-center w-3 h-3"
              >
                <div className="w-1.5 h-1.5 border-b-2 border-r-2 border-primary rotate-45 mb-0.5 group-hover:border-primary-hover" />
              </motion.div>
            </motion.button>
          )}
        </div>
        
        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          <AnimatePresence mode="popLayout">
            {displayedAchievements.map((achievement, index) => {
              const isUnlocked = unlockedAchievements.includes(achievement.id);
              const progress = achievement.getProgress ? achievement.getProgress(storeState) : (isUnlocked ? (achievement.maxProgress || 1) : 0);
              const max = achievement.maxProgress || 1;
              const percent = Math.min((progress / max) * 100, 100);
  
              return (
                <motion.button 
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: 0,
                    transition: {
                      delay: isExpanded && index >= 4 ? (index - 4) * 0.05 : 0,
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }
                  }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  key={achievement.id}
                  onClick={() => setSelectedBadge(achievement)}
                  whileHover={{ scale: 1.05, y: -4, transition: { type: "spring", stiffness: 400, damping: 10 } }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-5 rounded-[2.5rem] border shadow-sm transition-shadow flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-xl hover:border-primary/30 bg-white border-gray-100`}
                >
                  <motion.div 
                    className="relative w-16 h-16 mb-4 flex items-center justify-center bg-gray-50 rounded-[1.25rem] group-hover:bg-primary/5 transition-colors"
                    whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.4 } }}
                  >
                    {!isUnlocked && achievement.maxProgress && achievement.maxProgress > 1 && (
                      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-100" />
                        <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="6" fill="none" 
                          className="text-primary transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(109,80,245,0.4)]" 
                          strokeDasharray="289" strokeDashoffset={289 - (289 * percent) / 100} 
                          strokeLinecap="round" />
                      </svg>
                    )}
                    <span className={`text-4xl filter drop-shadow-md z-10 transition-transform group-hover:scale-110 duration-500 ${!isUnlocked && 'grayscale opacity-40'}`}>
                      {achievement.icon}
                    </span>
                  </motion.div>
                  
                  <h3 className="text-sm font-black text-gray-900 mb-1 tracking-tight group-hover:text-primary transition-colors">{achievement.title}</h3>
                  <div className="flex items-center gap-1.5 min-h-[1.25rem]">
                    {isUnlocked ? (
                       <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" 
                       />
                    ) : (
                       <span className="text-[9px] font-black uppercase text-gray-400 tracking-[0.1em] opacity-80">Locked</span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </section>

      {selectedBadge && (
        <BadgeDetailsModal 
          isOpen={true} 
          onClose={() => setSelectedBadge(null)} 
          achievement={selectedBadge} 
        />
      )}
    </>
  );
}
