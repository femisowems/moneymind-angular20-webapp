"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/Button";
import { NudgeMessage } from "@/components/NudgeMessage";
import { ReminderCard } from "@/components/ReminderCard";
import { StreakCard } from "@/components/StreakCard";
import { HealthScoreCard } from "@/components/HealthScoreCard";
import { MissedImpactCard } from "@/components/MissedImpactCard";
import { AddReminderModal } from "@/components/AddReminderModal";
import { SettingsModal } from "@/components/SettingsModal";
import { AuthModal } from "@/components/AuthModal";
import { ShopModal } from "@/components/ShopModal";
import { SearchModal } from "@/components/SearchModal";
import { AchievementsSection } from "@/components/AchievementsSection";
import { GoalsSection } from "@/components/GoalsSection";
import { CalendarView } from "@/components/CalendarView";
import { PlayerLevelBar } from "@/components/PlayerLevelBar";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import { Settings, LayoutList, Calendar as CalendarIcon, Cloud, BarChart2, Store, Search, Trash2, Tag, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const storeState = useStore();
  const { reminders, categories } = storeState;
  const { permission, requestPermission } = useNotifications();
  const [mounted, setMounted] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'Pending' | 'Completed' | 'All' | 'Deleted'>('Pending');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global Command Palette Hook
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }

      // Don't trigger if user is typing in an input, textarea or select
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName || '')) {
        return;
      }
      
      // Prevent firing if any modal is open
      if (isAddModalOpen || isSettingsOpen || isAuthOpen || isShopOpen || isSearchOpen) return;

      switch(e.key.toLowerCase()) {
        case 'c':
        case 'n':
          e.preventDefault();
          setIsAddModalOpen(true);
          break;
        case 's':
          e.preventDefault();
          setIsSettingsOpen(true);
          break;
        case 'v':
          e.preventDefault();
          setViewMode(prev => prev === 'list' ? 'calendar' : 'list');
          break;
        case 'i':
          e.preventDefault();
          window.location.href = '/insights';
          break;
        case '1':
          e.preventDefault();
          setStatusFilter('All');
          break;
        case '2':
          e.preventDefault();
          setStatusFilter('Pending');
          break;
        case '3':
          e.preventDefault();
          setStatusFilter('Completed');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddModalOpen, isSettingsOpen, isAuthOpen, isShopOpen, isSearchOpen, setViewMode, setStatusFilter]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  // First-Boot Onboarding Script
  useEffect(() => {
    if (mounted) {
       const state = useStore.getState();
       if (!state.hasCompletedOnboarding) {
         const today = new Date().toISOString();
         
         state.addReminder({
           title: "Swipe this card Right to complete it! 👉",
           category: "1",
           dueDate: today,
           recurring: "none"
         });
         
         state.addReminder({
           title: "Click me to edit my subtasks and notes 📝",
           category: "2",
           dueDate: today,
           recurring: "none",
           subTasks: [
             { id: crypto.randomUUID(), title: "Check out the Rewards Shop above 🛒", isCompleted: false },
             { id: crypto.randomUUID(), title: "Try pushing Cmd+K to search 🔍", isCompleted: false }
           ]
         });

         state.completeOnboarding();
       }
    }
  }, [mounted]);

  if (!mounted) {
    return (
      <main className="max-w-3xl mx-auto w-full p-4 sm:p-6 md:p-8 min-h-screen pb-24 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </main>
    );
  }

  const targetArray = statusFilter === 'Deleted' ? (storeState.deletedReminders || []) : reminders;

  const filteredReminders = targetArray
    .filter(r => activeFilter === 'All' || r.category === activeFilter)
    .filter(r => {
      if (statusFilter === 'All') return true;
      if (statusFilter === 'Deleted') return true;
      if (statusFilter === 'Completed') return r.isCompleted;
      return !r.isCompleted;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const today = format(new Date(), 'EEEE, MMMM do');

  return (
    <main className="max-w-3xl mx-auto w-full p-4 sm:p-6 md:p-8 min-h-screen pb-24">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pt-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            MoneyMind <span className="text-2xl">💸</span>
          </h1>
          <p className="text-gray-500 font-medium">{today}</p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3">
          {permission === 'default' && (
            <Button onClick={requestPermission} variant="secondary" size="sm" className="flex rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-700 font-medium tracking-tight whitespace-nowrap px-4 py-2 h-9 items-center justify-center gap-2 transition-all active:scale-95">
               <div className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
               Enable Alerts
            </Button>
          )}

          <div className="flex w-full sm:w-auto justify-center items-center p-1.5 sm:p-1 bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-[2rem] sm:rounded-full shadow-sm gap-1 sm:gap-0.5">
            <Button onClick={() => setIsSearchOpen(true)} variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 h-10 w-10 sm:h-9 sm:w-9 text-gray-500 hover:text-gray-900 transition-colors" title="Search (Cmd+K)">
              <Search className="w-5 h-5 sm:w-[18px] sm:h-[18px]" />
            </Button>
            <Button onClick={() => setIsShopOpen(true)} variant="ghost" size="icon" className="rounded-full hover:bg-indigo-50 h-10 w-10 sm:h-9 sm:w-9 text-indigo-400 hover:text-indigo-600 transition-colors" title="Shop">
              <Store className="w-5 h-5 sm:w-[18px] sm:h-[18px]" />
            </Button>
            <Link href="/insights" className="flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 rounded-full hover:bg-primary/10 transition-colors text-gray-500 hover:text-primary" title="Insights (I)">
              <BarChart2 className="w-5 h-5 sm:w-[18px] sm:h-[18px]" />
            </Link>
            <Button onClick={() => setIsAuthOpen(true)} variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 h-10 w-10 sm:h-9 sm:w-9 text-gray-500 hover:text-gray-900 transition-colors" title="Account">
              <Cloud className="w-5 h-5 sm:w-[18px] sm:h-[18px]" />
            </Button>
            <Button onClick={() => setIsSettingsOpen(true)} variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 h-10 w-10 sm:h-9 sm:w-9 text-gray-500 hover:text-gray-900 transition-colors" title="Settings">
              <Settings className="w-5 h-5 sm:w-[18px] sm:h-[18px]" />
            </Button>
          </div>

          <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all bg-gradient-to-r from-primary to-primary-hover px-6 py-2.5 h-11 sm:h-auto whitespace-nowrap flex items-center justify-center">
            <Plus className="w-5 h-5 mr-2 shrink-0" />
            Add Reminder
          </Button>
        </div>
      </header>

      <PlayerLevelBar />

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StreakCard />
        <HealthScoreCard />
        <MissedImpactCard />
      </div>

      <AchievementsSection />

      {/* Nudge Area */}
      <NudgeMessage />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Overview</h2>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-900'}`}
          >
            <LayoutList className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'calendar' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-900'}`}
          >
            <CalendarIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            <button
              onClick={() => setActiveFilter('All')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'All' 
                  ? 'bg-foreground text-background shadow-md' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === cat.id 
                    ? 'bg-foreground text-background shadow-md' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

              <div className="flex gap-2 text-sm bg-gray-100/80 p-1.5 rounded-full overflow-x-auto no-scrollbar snap-x shadow-inner">
                {[
                  { value: 'All', icon: <Tag className="w-4 h-4" />, label: 'View All' },
                  { value: 'Pending', icon: <Clock className="w-4 h-4" />, label: 'Pending' },
                  { value: 'Completed', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Completed' },
                  { value: 'Deleted', icon: <Trash2 className="w-4 h-4" />, label: 'Recycle Bin' }
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value as any)}
                    title={tab.label}
                    className={`px-3 py-1.5 rounded-full transition-all flex items-center justify-center ${
                      statusFilter === tab.value
                        ? 'bg-white shadow-sm text-foreground'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {tab.icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {filteredReminders.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center px-2 py-2">
                       <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase flex items-center gap-2">
                         {statusFilter === 'Deleted' ? 'Recycle Bin' : 'Your Tasks'} ({filteredReminders.length})
                       </h2>
                       {statusFilter === 'Deleted' && filteredReminders.length > 0 && (
                         <Button onClick={storeState.clearTrash} variant="ghost" size="sm" className="h-6 text-[10px] text-danger hover:bg-danger/10 hover:text-danger rounded-full px-2">
                           Empty Trash
                         </Button>
                       )}
                    </div>
                    {filteredReminders.map(reminder => (
                      <ReminderCard key={reminder.id} reminder={reminder} isDeletedItem={statusFilter === 'Deleted'} />
                    ))}
                  </div>
                ) : (
                  <motion.div
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50 backdrop-blur-sm"
              >
                <div className="text-4xl mb-3">🪹</div>
                <h3 className="font-semibold text-lg text-gray-900">All caught up!</h3>
                <p className="text-sm mt-1">No reminders found for this filter.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      ) : (
        <section className="mt-4">
          <CalendarView />
        </section>
      )}

      <AddReminderModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </main>
  );
}
