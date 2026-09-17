import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase (Vite client-side and server-side fallback)
const supabaseUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  'https://demo-industrial-mfg.supabase.co';

const supabaseAnonKey = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
  'demo-anon-key';

export const isSupabaseConfigured = () => {
  return (
    Boolean(supabaseUrl) &&
    !supabaseUrl.includes('your-project') &&
    !supabaseUrl.includes('demo-industrial') &&
    Boolean(supabaseAnonKey) &&
    !supabaseAnonKey.includes('...')
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
