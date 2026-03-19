"use client";

import { useStore } from "@/store/useStore";
import { Card } from "./ui/Card";
import { Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function HealthScoreCard() {
  const { score, calculateScore, reminders, streak } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    calculateScore();
    return () => clearTimeout(t);
  }, [reminders, streak, calculateScore]);

  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!mounted) return;
    
    const duration = 1000;
    const steps = 30;
    const stepTime = Math.abs(Math.floor(duration / steps));
    let current = 0;
    
    const timer = setInterval(() => {
      current += score.value / steps;
      if (current >= score.value) {
        setDisplayScore(score.value);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [score.value, mounted]);

  if (!mounted) {
    return (
      <Card className="p-5 flex flex-col justify-between h-[155px] animate-pulse bg-gray-50" />
    );
  }

  const getColor = () => {
    if (score.value >= 80) return "text-success bg-success/10";
    if (score.value >= 50) return "text-warning bg-warning/10";
    return "text-danger bg-danger/10";
  };
  
  const getGradient = () => {
    if (score.value >= 80) return "from-emerald-400 to-emerald-600";
    if (score.value >= 50) return "from-yellow-400 to-orange-500";
    return "from-red-400 to-red-600";
  };

  return (
    <Card className="p-5 flex flex-col justify-between overflow-hidden relative">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-gray-500 font-medium text-sm">Financial Health</h3>
          <div className="text-3xl font-bold mt-1 text-foreground flex items-center gap-2">
            {displayScore}<span className="text-lg text-gray-400 font-normal">%</span>
          </div>
        </div>
        <div className={`p-3 rounded-full ${getColor()}`}>
          <Activity className="w-6 h-6" />
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between text-xs font-semibold mb-2">
          <span className="text-gray-500">Status</span>
          <span className={getColor().split(' ')[0]}>{score.label}</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${score.value}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full bg-gradient-to-r ${getGradient()}`}
          />
        </div>
      </div>

      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-2xl z-0" />
    </Card>
  );
}
