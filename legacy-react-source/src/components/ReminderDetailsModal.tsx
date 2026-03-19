"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Reminder } from "@/types";
import { format, addDays } from "date-fns";
import { ExternalLink, Calendar, Repeat, MessageSquare, CreditCard, DollarSign, PencilLine, CheckSquare, Plus, X, History, Paperclip, Image as ImageIcon, Trash2 } from "lucide-react";
import { useRef } from "react";
import { Badge } from "./ui/Badge";
import { Input } from "./ui/Input";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reminder: Reminder | null;
}

export function ReminderDetailsModal({ isOpen, onClose, reminder }: Props) {
  const { categories, updateReminder } = useStore();
  
  // Local edit states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editNotes, setEditNotes] = useState("");

  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editCategory, setEditCategory] = useState("");

  const [newSubTask, setNewSubTask] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (reminder) {
      setEditTitle(reminder.title);
      setEditAmount(reminder.amount?.toString() || "");
      setEditNotes(reminder.notes || "");
      setEditCategory(reminder.category);
    }
  }, [reminder]);

  if (!reminder) return null;

  const categoryData = categories.find(c => c.id === reminder.category) || { name: 'Unknown', color: 'neutral' as any };

  // Handlers
  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== reminder.title) {
      updateReminder(reminder.id, { title: editTitle.trim() });
    } else {
      setEditTitle(reminder.title);
    }
    setIsEditingTitle(false);
  };

  const handleSaveAmount = () => {
    const parsed = parseFloat(editAmount);
    if (!isNaN(parsed) && parsed !== reminder.amount) {
      updateReminder(reminder.id, { amount: parsed });
    } else if (editAmount === "" && reminder.amount !== undefined) {
      updateReminder(reminder.id, { amount: undefined });
    } else {
      setEditAmount(reminder.amount?.toString() || "");
    }
    setIsEditingAmount(false);
  };

  const handleSaveNotes = () => {
    if (editNotes.trim() !== (reminder.notes || "")) {
      updateReminder(reminder.id, { notes: editNotes.trim() || undefined });
    }
    setIsEditingNotes(false);
  };

  const handleSaveCategory = (newCatId: string) => {
    updateReminder(reminder.id, { category: newCatId });
    setIsEditingCategory(false);
  };

  const handleSnooze = (days: number) => {
    const newDate = addDays(new Date(reminder.dueDate), days);
    updateReminder(reminder.id, { dueDate: newDate.toISOString() });
  };

  const handleAddSubTask = () => {
    if (!newSubTask.trim()) return;
    const currentList = reminder.subTasks || [];
    updateReminder(reminder.id, { 
      subTasks: [...currentList, { id: crypto.randomUUID(), title: newSubTask.trim(), isCompleted: false }] 
    });
    setNewSubTask("");
  };

  const handleToggleSubTask = (subId: string) => {
    const list = reminder.subTasks || [];
    updateReminder(reminder.id, {
      subTasks: list.map(st => st.id === subId ? { ...st, isCompleted: !st.isCompleted } : st)
    });
  };

  const handleDeleteSubTask = (subId: string) => {
    const list = reminder.subTasks || [];
    updateReminder(reminder.id, {
      subTasks: list.filter(st => st.id !== subId)
    });
  };

  const subTasks = reminder.subTasks || [];
  const completedSubTasks = subTasks.filter(st => st.isCompleted).length;
  const subTaskProgress = subTasks.length > 0 ? (completedSubTasks / subTasks.length) * 100 : 0;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File too large. Maximum size is 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateReminder(reminder.id, { attachment: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = () => {
    updateReminder(reminder.id, { attachment: undefined });
  };

  const getDomainFromUrl = (url: string) => {
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      return parsed.hostname;
    } catch {
      return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reminder Details">
      <div className="flex flex-col gap-6 pt-2">
        {/* Header Info */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            {isEditingTitle ? (
              <Input
                autoFocus
                className="text-xl font-bold mb-2 p-1 px-2 h-auto"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
              />
            ) : (
              <h2 
                className="text-xl font-bold text-gray-900 mb-2 truncate cursor-pointer hover:text-primary transition-colors group flex items-center gap-2"
                onClick={() => setIsEditingTitle(true)}
              >
                {reminder.title}
                <PencilLine className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100" />
              </h2>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-1">
              {isEditingCategory ? (
                <select
                  autoFocus
                  className="text-xs font-semibold px-2 py-1 rounded-full border border-primary outline-none bg-white text-gray-900 cursor-pointer shadow-sm"
                  value={editCategory}
                  onChange={e => handleSaveCategory(e.target.value)}
                  onBlur={() => setIsEditingCategory(false)}
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              ) : (
                <div onClick={() => setIsEditingCategory(true)} className="cursor-pointer hover:opacity-80 transition-opacity" title="Change Category">
                  <Badge variant={categoryData.color}>{categoryData.name}</Badge>
                </div>
              )}
              {reminder.autoPay && (
                <Badge variant="info">Auto-Pay Active</Badge>
              )}
              {reminder.isCompleted && (
                <Badge variant="success">Completed</Badge>
              )}
            </div>
          </div>
          
          <div className="text-right shrink-0">
            <span className="block text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Amount</span>
            {isEditingAmount ? (
              <Input
                autoFocus
                type="number"
                className="w-24 text-right font-bold p-1 px-2 h-auto border-primary"
                value={editAmount}
                onChange={e => setEditAmount(e.target.value)}
                onBlur={handleSaveAmount}
                onKeyDown={e => e.key === 'Enter' && handleSaveAmount()}
              />
            ) : (
              <span 
                className="text-2xl font-bold text-foreground flex items-center justify-end cursor-pointer hover:text-primary group"
                onClick={() => setIsEditingAmount(true)}
              >
                {reminder.amount ? (
                  <>
                    <DollarSign className="w-5 h-5 text-gray-400 group-hover:text-primary/50" />
                    {reminder.amount.toFixed(2)}
                  </>
                ) : (
                  <span className="text-sm font-normal text-gray-400 border border-dashed border-gray-300 rounded px-2 hover:border-primary">Set Amount</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4" /> Due Date
            </span>
            <span className="text-sm font-medium text-gray-900">
              {format(new Date(reminder.dueDate), "EEEE, MMM do yyyy")}
            </span>
            {!reminder.isCompleted && (
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleSnooze(1)} className="text-[10px] bg-white border border-gray-200 hover:border-primary/50 text-gray-600 px-2 py-1 rounded shadow-sm transition-colors">
                  +1 Day
                </button>
                <button onClick={() => handleSnooze(3)} className="text-[10px] bg-white border border-gray-200 hover:border-primary/50 text-gray-600 px-2 py-1 rounded shadow-sm transition-colors">
                  +3 Days
                </button>
                <button onClick={() => handleSnooze(7)} className="text-[10px] bg-white border border-gray-200 hover:border-primary/50 text-gray-600 px-2 py-1 rounded shadow-sm transition-colors">
                  Next Week
                </button>
              </div>
            )}
          </div>
          
          <div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              <Repeat className="w-4 h-4" /> Recurring
            </span>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {reminder.recurring}
            </span>
          </div>
          
          {reminder.lateFee && (
            <div className="col-span-2 pt-2 mt-2 border-t border-gray-200/60">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-danger uppercase tracking-wider mb-1">
                Potential Late Fee
              </span>
              <span className="text-sm font-medium text-gray-900">
                ${reminder.lateFee.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* SubTasks Checklist */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center mb-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <CheckSquare className="w-4 h-4" /> Checklist ({completedSubTasks}/{subTasks.length})
            </span>
          </div>
          
          {subTasks.length > 0 && (
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${subTaskProgress}%` }}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            {subTasks.map(st => (
              <div key={st.id} className="flex items-center justify-between group bg-white border border-gray-100 p-2 rounded-xl shadow-sm hover:border-primary/30 transition-colors">
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => handleToggleSubTask(st.id)}
                >
                  <input 
                    type="checkbox" 
                    readOnly
                    checked={st.isCompleted} 
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary ml-1"
                  />
                  <span className={`text-sm select-none transition-colors ${st.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                    {st.title}
                  </span>
                </div>
                <button 
                  onClick={() => handleDeleteSubTask(st.id)}
                  className="text-gray-300 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <div className="flex items-center gap-2 mt-1">
              <Input 
                placeholder="Add new step..."
                value={newSubTask}
                onChange={e => setNewSubTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSubTask()}
                className="h-9 text-sm flex-1 bg-gray-50 border-gray-100"
              />
              <Button size="icon" onClick={handleAddSubTask} variant="secondary" className="h-9 w-9 shrink-0 shadow-none">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Notes & URLs */}
        <div className="flex flex-col gap-4">
          <div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <MessageSquare className="w-4 h-4" /> Notes
            </span>
            {isEditingNotes ? (
              <textarea
                autoFocus
                className="flex w-full rounded-xl border border-primary bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 shadow-sm min-h-[80px]"
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                onBlur={handleSaveNotes}
              />
            ) : (
              <p 
                onClick={() => setIsEditingNotes(true)}
                className={`text-sm bg-white border border-gray-200 p-3 rounded-xl whitespace-pre-wrap leading-relaxed shadow-sm cursor-pointer hover:border-primary/50 group transition-colors min-h-[48px] ${!reminder.notes ? 'text-gray-400 italic' : 'text-gray-700'}`}
              >
                {reminder.notes || "Click to add a note..."}
              </p>
            )}
          </div>
          
          {reminder.url && (
            <div>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                <ExternalLink className="w-4 h-4" /> Payment Link
              </span>
              <a 
                href={reminder.url.startsWith('http') ? reminder.url : `https://${reminder.url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-900 group hover:text-primary-hover font-medium bg-white hover:bg-primary/5 transition-colors p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-primary/30 shadow-sm"
              >
                {getDomainFromUrl(reminder.url) ? (
                  <img 
                    src={`https://www.google.com/s2/favicons?domain=${getDomainFromUrl(reminder.url)}&sz=64`} 
                    alt="Favicon" 
                    className="w-8 h-8 rounded-lg shadow-sm bg-white shrink-0 object-contain p-0.5 border border-gray-100 group-hover:scale-105 transition-transform" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                )}
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate font-semibold">{getDomainFromUrl(reminder.url) || "Visit Link"}</span>
                  <span className="truncate text-xs text-gray-500 font-normal">{reminder.url}</span>
                </div>
              </a>
            </div>
          )}
        </div>

        {/* Attachments */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <Paperclip className="w-4 h-4" /> Attachment
            </span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            {!reminder.attachment && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-primary hover:text-primary-hover flex items-center gap-1 bg-primary/5 hover:bg-primary/10 rounded-full px-2 py-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Upload Receipt
              </button>
            )}
          </div>
          
          {reminder.attachment && (
            <div className="relative group rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center p-2 mb-2 w-max cursor-zoom-in" onClick={() => setPreviewImage(reminder.attachment as string)}>
              <img 
                src={reminder.attachment} 
                alt="Attachment" 
                className="h-20 max-w-full object-contain rounded"
              />
              <button 
                onClick={(e) => { e.stopPropagation(); removeAttachment(); }}
                className="absolute top-1 right-1 bg-white/90 shadow-sm text-danger hover:bg-danger hover:text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Payment History Log */}
        {reminder.history && reminder.history.length > 0 && (
          <div className="pt-2 border-t border-gray-100 mt-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <History className="w-4 h-4" /> Completion History
            </span>
            <div className="flex flex-col gap-2 relative pl-2">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gray-200" />
              {[...reminder.history].reverse().map((dateStr, i) => (
                <div key={i} className="flex items-center gap-3 relative z-10">
                  <div className="w-2 h-2 rounded-full bg-success ring-4 ring-white shadow-sm" />
                  <span className="text-sm font-medium text-gray-700">
                    {format(new Date(dateStr), "MMM do, yyyy 'at' h:mm a")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose} variant="secondary">
            Close 
          </Button>
        </div>
      </div>

      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <img 
            src={previewImage} 
            alt="Full Preview" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </Modal>
  );
}
