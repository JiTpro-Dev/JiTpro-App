import { createClient } from '@supabase/supabase-js';

const sandboxUrl = import.meta.env.VITE_SANDBOX_SUPABASE_URL;
const sandboxAnonKey = import.meta.env.VITE_SANDBOX_SUPABASE_ANON_KEY;

if (!sandboxUrl || !sandboxAnonKey) {
  throw new Error('Missing Sandbox Supabase environment variables');
}

export const sandboxSupabase = createClient(sandboxUrl, sandboxAnonKey);
