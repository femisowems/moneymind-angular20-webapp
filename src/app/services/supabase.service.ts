import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = (import.meta as any).env?.['NEXT_PUBLIC_SUPABASE_URL'] || 'https://placeholder.supabase.co';
    const supabaseAnonKey = (import.meta as any).env?.['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || 'placeholder';
    
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  get client(): SupabaseClient {
    return this.supabase;
  }
}
