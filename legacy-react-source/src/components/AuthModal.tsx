"use client";

import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { Cloud, Download, Upload, LogOut, Loader2, Mail } from "lucide-react";
import { useStore } from "@/store/useStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: { emailRedirectTo: window.location.origin }
    });
    if (error) setMessage("Error: " + error.message);
    else setMessage("Check your email for the magic login link! ✉️");
    setLoading(false);
  };

  const syncToCloud = async () => {
    if (!session?.user) return;
    setLoading(true);
    setMessage("");
    
    // We are safely stringifying and parsing the raw Zustand persisted state
    const rawStorage = localStorage.getItem('moneymind-storage');
    if (!rawStorage) {
      setMessage("No local data found to sync.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: session.user.id, 
        app_state: JSON.parse(rawStorage), 
        updated_at: new Date() 
      });
      
    if (error) setMessage("Sync failed: " + error.message);
    else setMessage("Successfully backed up to Cloud ☁️!");
    setLoading(false);
  };

  const pullFromCloud = async () => {
    if (!session?.user) return;
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from('profiles')
      .select('app_state')
      .eq('id', session.user.id)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      setMessage("Restore failed: " + error.message);
    } else if (data && data.app_state) {
      // Overwrite the local storage entirely and force a reload to let Zustand rehydrate
      localStorage.setItem('moneymind-storage', JSON.stringify(data.app_state));
      setMessage("Restored from Cloud! Reloading app...");
      setTimeout(() => window.location.reload(), 1000);
    } else {
      setMessage("No cloud backup found on your account.");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMessage("Logged out successfully.");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cloud Sync & Account">
      <div className="flex flex-col gap-6 pt-2">
        {!session ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <p className="text-sm text-gray-500 text-center">
              Sign in to enable cross-device cloud sync and securely backup your progress!
            </p>
            <Input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-50 focus:bg-white transition-colors"
            />
            <Button type="submit" className="w-full flex justify-center items-center py-6 border-none" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Mail className="w-5 h-5 mr-2" />}
              Send Magic Link
            </Button>
            {message && <p className="text-sm text-center font-medium text-emerald-600 bg-emerald-50 p-3 rounded-xl">{message}</p>}
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-primary/5 p-4 rounded-2xl flex items-center justify-between border border-primary/20">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Signed in as</span>
                <span className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{session.user.email}</span>
              </div>
              <Button variant="danger" onClick={handleLogout} className="text-xs px-3 py-1.5 h-auto">
                <LogOut className="w-4 h-4 mr-1.5" /> Logout
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <button 
                onClick={syncToCloud}
                disabled={loading}
                className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-2xl hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-50 group shadow-sm hover:shadow-md"
              >
                <Upload className="w-8 h-8 mb-2 text-gray-400 group-hover:text-primary transition-colors" />
                <span className="text-sm font-bold">Push to Cloud</span>
                <span className="text-xs text-gray-400 mt-1">Backup your data</span>
              </button>

              <button 
                onClick={pullFromCloud}
                disabled={loading}
                className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-2xl hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-50 group shadow-sm hover:shadow-md"
              >
                <Download className="w-8 h-8 mb-2 text-gray-400 group-hover:text-primary transition-colors" />
                <span className="text-sm font-bold">Pull from Cloud</span>
                <span className="text-xs text-gray-400 mt-1">Restore your data</span>
              </button>
            </div>
            
            {(loading || message) && (
              <div className="mt-2 text-center text-sm font-medium bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-center">
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {message || "Processing..."}
              </div>
            )}
          </div>
        )}

        <div className="border-t border-gray-100 mt-2" />
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}
