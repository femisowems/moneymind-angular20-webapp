"use client";

import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Snowflake, Store, Zap, ShieldCheck } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ShopModal({ isOpen, onClose }: Props) {
  const { score, inventory, purchaseItem } = useStore();
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);

  const handlePurchase = (item: 'streakFreeze', cost: number) => {
    const success = purchaseItem(item, cost);
    if (success) {
      setPurchaseStatus("Purchase successful! Streak protected. 🛡️");
      setTimeout(() => setPurchaseStatus(null), 3000);
    } else {
      setPurchaseStatus("Not enough XP to make this purchase.");
      setTimeout(() => setPurchaseStatus(null), 3000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rewards Shop">
      <div className="flex flex-col gap-6 pt-2">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex items-center justify-between">
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-3xl rounded-full" />
           <div className="relative z-10 flex flex-col">
             <span className="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-1">Available Balance</span>
             <span className="text-4xl font-black flex items-center gap-2">
               {score.xp} <span className="text-xl font-bold text-indigo-200 uppercase tracking-widest mt-1">XP</span>
             </span>
           </div>
           <Store className="w-12 h-12 text-white/20 absolute right-6 z-0" />
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> Power-Ups
          </h3>
          
          <div className="bg-white border border-gray-200 rounded-3xl p-5 hover:border-primary/50 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-500 border border-cyan-100 shadow-sm shrink-0">
                  <Snowflake className="w-7 h-7" />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    Streak Freeze
                    {inventory.streakFreezes > 0 && (
                      <span className="text-[10px] bg-cyan-100 text-cyan-700 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> {inventory.streakFreezes} Active
                      </span>
                    )}
                  </h4>
                  <p className="text-sm font-medium text-gray-500 mt-1">Protect your hard-earned streak! If you forget to log a task for incredibly busy days, this freeze automatically consumes itself to stop your streak from resetting to zero.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
               <span className="text-xl font-black text-gray-900 flex items-center gap-1.5">
                 500 <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">XP</span>
               </span>
               <Button 
                 onClick={() => handlePurchase('streakFreeze', 500)}
                 disabled={score.xp < 500}
                 className="shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 px-6"
               >
                 Purchase
               </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {purchaseStatus && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className={`p-3 rounded-xl text-center text-sm font-bold border ${purchaseStatus.includes('successful') ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}
            >
              {purchaseStatus}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
