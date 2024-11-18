import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://ugpzpzvfjsajlxhazjzr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVncHpwenZmanNhamx4aGF6anpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4NjU1NDgsImV4cCI6MjA0NzQ0MTU0OH0.u-r2QJBl-IplbS-C2wRT1wSalqcil7HWQPAaki8W3ks';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': '1kind-ai'
    }
  },
  db: {
    schema: 'public'
  }
});