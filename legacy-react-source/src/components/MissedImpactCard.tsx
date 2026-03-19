"use client";

import { useStore } from "@/store/useStore";
import { Card } from "./ui/Card";
import { TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function MissedImpactCard() {
  const { reminders } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) {
    return <Card className="p-5 flex flex-col justify-between h-[155px] animate-pulse bg-gray-50" />;
  }

  const todayStr = new Date().toISOString().substring(0, 10);
  
  const wastedMoney = reminders.reduce((total, r) => {
    const dueStr = r.dueDate.substring(0, 10);
    // If it's missed (overdue and not completed), add late fee if it exists
    if (!r.isCompleted && dueStr < todayStr && r.lateFee) {
      return total + r.lateFee;
    }
    return total;
  }, 0);

  return (
    <Card className="p-5 flex flex-col justify-between overflow-hidden relative border-danger/20">
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div>
          <h3 className="text-gray-500 font-medium text-sm flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4" />
            Missed Impact
          </h3>
          <div className="text-3xl font-bold mt-1 text-foreground flex items-center gap-1.5">
            <span className="text-xl text-gray-400 font-normal">$</span>
            {wastedMoney.toFixed(2)}
          </div>
        </div>
        <div className="p-2.5 rounded-full bg-danger/10 text-danger shadow-sm">
          <span className="text-xl">💸</span>
        </div>
      </div>
      
      <div className="relative z-10">
        <p className="text-xs text-gray-500 leading-relaxed max-w-[90%]">
          {wastedMoney > 0 
            ? "Money wasted on late fees. Try to complete pending bills on time!" 
            : "You've saved 100% of potential late fees. Great job!"}
        </p>
      </div>
      
      {/* Decorative background circle */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-danger/5 rounded-full blur-2xl z-0" />
    </Card>
  );
}
