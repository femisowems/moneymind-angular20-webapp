"use client";

import { useStore } from "@/store/useStore";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, Loader2 } from "lucide-react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { format } from "date-fns";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareScorecardModal({ isOpen, onClose }: Props) {
  const { score, streak, unlockedAchievements } = useStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsCapturing(true);
      const canvas = await html2canvas(cardRef.current, { 
        scale: 2, 
        backgroundColor: null,
        logging: false 
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `MoneyMind-Scorecard-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to capture scorecard:", error);
    } finally {
      setIsCapturing(false);
      onClose();
    }
  };

  const unlockedList = ACHIEVEMENTS.filter(a => unlockedAchievements.includes(a.id));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Your Progress">
      <div className="flex flex-col gap-6 pt-2">
        <p className="text-sm text-gray-500 text-center">
          Show off your financial consistency! Download this scorecard and share it with your friends.
        </p>

        {/* The Card to be captured */}
        <div className="flex justify-center">
          <div 
            ref={cardRef} 
            className="w-full max-w-sm bg-gradient-to-br from-primary via-[#6d50f5] to-[#4527d4] p-6 rounded-3xl text-white shadow-xl relative overflow-hidden"
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-12 translate-x-12" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl translate-y-8 -translate-x-8" />
            
            <div className="relative z-10 flex flex-col items-center">
              <h1 className="text-2xl font-black italic tracking-tight mb-1 text-white">MoneyMind</h1>
              <span className="text-primary-100/80 text-xs font-semibold uppercase tracking-widest mb-6">Financial Scorecard</span>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 w-full flex flex-col items-center border border-white/20 mb-6">
                <span className="text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Health Score</span>
                <span className="text-5xl font-black mb-1 drop-shadow-md">{score.value}</span>
                <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">{score.label}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full mb-6">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex flex-col items-center border border-white/10">
                  <span className="text-xs text-white/70 mb-1">Level</span>
                  <span className="text-xl font-bold">{score.level}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex flex-col items-center border border-white/10">
                  <span className="text-xs text-white/70 mb-1">XP Base</span>
                  <span className="text-xl font-bold">{score.xp}</span>
                </div>
                <div className="col-span-2 bg-white/10 backdrop-blur-md rounded-xl p-3 flex flex-col items-center border border-white/10">
                  <span className="text-xs text-white/70 mb-1">Longest Streak</span>
                  <span className="text-xl font-bold">{streak.longestStreak} Days</span>
                </div>
              </div>

              {unlockedList.length > 0 && (
                <div className="w-full">
                  <span className="text-xs font-bold text-white/70 uppercase tracking-wider mb-2 block text-center">Top Badges</span>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {unlockedList.slice(0, 5).map(ach => (
                      <div key={ach.id} className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full text-lg shadow-sm border border-white/30">
                        {ach.icon}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <Button variant="ghost" onClick={onClose} disabled={isCapturing}>Cancel</Button>
          <Button onClick={handleDownload} disabled={isCapturing} className="bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/30">
            {isCapturing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Download className="w-5 h-5 mr-2" />}
            Download PNG
          </Button>
        </div>
      </div>
    </Modal>
  );
}
