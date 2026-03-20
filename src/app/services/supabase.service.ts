import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = (import.meta as any).env?.['NEXT_PUBLIC_SUPABASE_URL'] || 'https://placeholder.supabase.co';
    const supabaseAnonKey = (import.meta as any).env?.['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || 'placeholder';
    
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    this.setupAuthListener();
  }

  user = signal<User | null>(null);

  private async setupAuthListener() {
    const { data: { session } } = await this.supabase.auth.getSession();
    this.user.set(session?.user ?? null);

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.user.set(session?.user ?? null);
    });
  }

  async signUp(email: string) {
    return this.supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
  }

  async signIn(email: string) {
    return this.supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
  }

  async signOut() {
    await this.supabase.auth.signOut();
  }

  get client(): SupabaseClient {
    return this.supabase;
  }
}
