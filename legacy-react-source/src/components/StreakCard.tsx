"use client";

import { useStore } from "@/store/useStore";
import { Card } from "./ui/Card";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function StreakCard() {
  const { streak } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) {
    return (
      <Card className="p-5 flex flex-col justify-between h-[155px] animate-pulse bg-gray-50" />
    );
  }

  const progress = Math.min((streak.currentStreak / 7) * 100, 100);

  return (
    <Card className="p-5 flex flex-col justify-between overflow-hidden relative">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-gray-500 font-medium text-sm">Current Streak</h3>
          <div className="text-3xl font-bold mt-1 text-foreground flex items-center gap-2">
            {streak.currentStreak} <span className="text-lg text-gray-400 font-normal">days</span>
          </div>
        </div>
        <div className={`p-3 rounded-full ${streak.currentStreak > 0 ? 'bg-orange-100 text-orange-500' : 'bg-gray-100 text-gray-400'}`}>
          <Flame className="w-6 h-6" />
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Weekly Goal</span>
          <span>{streak.currentStreak}/7 Days</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${streak.currentStreak > 0 ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gray-300'}`}
          />
        </div>
      </div>
      
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-50 rounded-full blur-2xl z-0" />
    </Card>
  );
}
