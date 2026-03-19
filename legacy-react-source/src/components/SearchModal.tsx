"use client";

import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { useStore } from "@/store/useStore";
import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { ReminderDetailsModal } from "./ReminderDetailsModal";
import { Reminder } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: Props) {
  const { reminders } = useStore();
  const [query, setQuery] = useState("");
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return reminders.filter(r => 
      r.title.toLowerCase().includes(q) || 
      (r.notes && r.notes.toLowerCase().includes(q)) || 
      (r.amount && r.amount.toString().includes(q))
    ).slice(0, 10);
  }, [query, reminders]);

  useEffect(() => {
    if (!isOpen) { 
      setQuery(""); 
      setSelectedReminder(null); 
    }
  }, [isOpen]);

  const handleNestedClose = () => {
    setSelectedReminder(null);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Global Search">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input 
            autoFocus
            placeholder="Search by title, note, or amount..." 
            value={query} 
            onChange={e => setQuery(e.target.value)}
            className="pl-11 h-14 text-lg bg-gray-50/50 border-gray-200 shadow-inner rounded-2xl"
          />
        </div>

        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {query.trim() && results.length === 0 && (
            <p className="text-sm text-center text-gray-400 py-8 italic">No results found for &quot;{query}&quot;</p>
          )}
          
          {results.map(r => (
            <button 
              key={r.id}
              onClick={() => setSelectedReminder(r)}
              className="text-left w-full p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 hover:border-primary/30 transition-all shadow-sm flex justify-between items-center group relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              <div className="flex flex-col pl-1">
                <span className="font-bold text-gray-900 group-hover:text-primary transition-colors">{r.title}</span>
                {r.notes && <span className="text-xs font-semibold text-gray-400 line-clamp-1 mt-0.5">{r.notes}</span>}
              </div>
              <div className="flex items-center gap-3">
                 {r.amount !== undefined && <span className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">${r.amount}</span>}
                 {r.isCompleted && <span className="text-[10px] font-black uppercase tracking-widest text-success border border-success/30 bg-success/10 px-2 py-0.5 rounded-full">Done</span>}
              </div>
            </button>
          ))}
        </div>
      </Modal>
      
      {selectedReminder && (
        <ReminderDetailsModal isOpen={true} onClose={handleNestedClose} reminder={selectedReminder} />
      )}
    </>
  );
}
