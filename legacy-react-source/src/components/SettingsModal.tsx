"use client";

import { useState } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Download, Upload, AlertTriangle, Trash2, Plus } from "lucide-react";
import { useStore } from "@/store/useStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { categories, addCategory, deleteCategory } = useStore();
  const [importWarning, setImportWarning] = useState(false);
  
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState<any>("neutral");

  const handleExport = () => {
    const data = localStorage.getItem("moneymind-storage");
    if (!data) return;
    
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moneymind-backup-${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const parsed = JSON.parse(result);
        if (parsed && parsed.state && Array.isArray(parsed.state.reminders)) {
          localStorage.setItem("moneymind-storage", result);
          window.location.reload();
        } else {
          alert("Invalid backup file format.");
        }
      } catch (err) {
        alert("Found an error parsing the backup file.");
      }
    };
    reader.readAsText(file);
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    addCategory({ name: newCatName.trim(), color: newCatColor });
    setNewCatName("");
    setNewCatColor("neutral");
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { setImportWarning(false); onClose(); }} title="Settings">
      <div className="flex flex-col gap-8 max-h-[70vh] overflow-y-auto px-1 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">Data Backup</h3>
          <p className="text-sm text-gray-600 mb-4">
            MoneyMind keeps your data private by storing it offline in your browser. 
            Export a backup file to save your data or transfer it to another device.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleExport} variant="secondary" className="w-full sm:w-auto h-12 shadow-sm">
              <Download className="w-4 h-4 mr-2" />
              Export Backup (.json)
            </Button>

            {!importWarning ? (
              <Button onClick={() => setImportWarning(true)} variant="ghost" className="w-full sm:w-auto h-12 border border-gray-200">
                <Upload className="w-4 h-4 mr-2" />
                Import Data...
              </Button>
            ) : (
              <div className="p-4 bg-danger/10 text-danger rounded-xl border border-danger/20 flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">
                    Importing will overwrite your current progress and reminders.
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="danger" className="w-full pointer-events-none">
                    Select File & Upload
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">Custom Categories</h3>
          
          <div className="flex gap-2 mb-4">
            <Input 
              placeholder="New Category Name" 
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1"
            />
            <Select 
              className="w-28 shrink-0"
              value={newCatColor}
              onChange={(e) => setNewCatColor(e.target.value)}
              options={[
                { label: "Neutral", value: "neutral" },
                { label: "Success", value: "success" },
                { label: "Warning", value: "warning" },
                { label: "Danger", value: "danger" },
                { label: "Primary", value: "primary" },
                { label: "Info", value: "info" },
              ]}
            />
            <Button onClick={handleAddCategory} size="icon" className="shrink-0 rounded-xl px-3 w-auto">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {categories.map(c => (
              <div key={c.id} className="flex justify-between items-center text-sm p-2 rounded-lg border border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full bg-${c.color}`} />
                  <span className="font-medium text-gray-700">{c.name}</span>
                </div>
                {/* Prevent deleting default 4 if they are ID 1-4 for safety, else allow */}
                {!['1', '2', '3', '4'].includes(c.id) && (
                  <Button variant="ghost" size="sm" onClick={() => deleteCategory(c.id)} className="h-7 w-7 p-0 text-gray-400 hover:text-danger rounded-full">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
