import { useState } from "react";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Select } from "./ui/Select";
import { useStore } from "@/store/useStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AddReminderModal({ isOpen, onClose }: Props) {
  const addReminder = useStore(state => state.addReminder);
  const categories = useStore(state => state.categories);
  
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [lateFee, setLateFee] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().substring(0, 10));
  const [category, setCategory] = useState<string>("1");
  const [recurring, setRecurring] = useState<"none" | "daily" | "weekly" | "monthly" | "yearly">("none");
  const [notes, setNotes] = useState("");
  const [url, setUrl] = useState("");
  const [autoPay, setAutoPay] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addReminder({
      title,
      amount: amount ? parseFloat(amount) : undefined,
      lateFee: lateFee ? parseFloat(lateFee) : undefined,
      dueDate,
      category,
      recurring,
      notes: notes.trim() || undefined,
      url: url.trim() || undefined,
      autoPay,
    });

    setTitle("");
    setAmount("");
    setLateFee("");
    setDueDate(new Date().toISOString().substring(0, 10));
    setCategory("1");
    setRecurring("none");
    setNotes("");
    setUrl("");
    setAutoPay(false);
    setShowAdvanced(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Reminder">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <Input 
            required 
            placeholder="e.g. Rent, Netflix, Transfer to Savings" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (optional)</label>
            <Input 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Potential Late Fee ($)</label>
            <Input 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              value={lateFee} 
              onChange={(e) => setLateFee(e.target.value)} 
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <Input  
              type="date" 
              required 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <Select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              options={categories.map(c => ({ label: c.name, value: c.id }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recurring</label>
            <Select 
              value={recurring} 
              onChange={(e) => setRecurring(e.target.value as "none" | "daily" | "weekly" | "monthly" | "yearly")}
              options={[
                { label: "None", value: "none" },
                { label: "Daily", value: "daily" },
                { label: "Weekly", value: "weekly" },
                { label: "Monthly", value: "monthly" },
                { label: "Yearly", value: "yearly" },
              ]}
            />
          </div>
          <div className="col-span-2">
            <button 
              type="button" 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-primary text-sm font-medium flex items-center gap-1 hover:underline mt-2"
            >
              {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
            </button>
          </div>

          {showAdvanced && (
            <>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment/Action URL</label>
                <Input 
                  type="url" 
                  placeholder="https://pay.example.com" 
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)} 
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea 
                  className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all shadow-sm"
                  rows={2}
                  placeholder="Additional details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <div className="col-span-2 flex items-center gap-2 mt-1">
                <input 
                  type="checkbox" 
                  id="autopay"
                  checked={autoPay}
                  onChange={(e) => setAutoPay(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                />
                <label htmlFor="autopay" className="text-sm font-medium text-gray-700 cursor-pointer">
                  This task is on Auto-Pay
                </label>
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Add Reminder
          </Button>
        </div>
      </form>
    </Modal>
  );
}
