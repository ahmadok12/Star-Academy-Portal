import { createClient } from '@supabase/supabase-js';

// Default configuration for Star Academy Supabase instance
const DEFAULT_SUPABASE_URL = 'https://uabmraigtipjomnpclkd.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYm1yYWlndGlwam9tbnBjbGtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMjgwMjQsImV4cCI6MjEwNDYwNDAyNH0._Twe7n4G_U8hmLUVLgvrUTwut3YWDrKeeeqnN2DTi3o';

const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
const envAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

const supabaseUrl = envUrl || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = envAnonKey || DEFAULT_SUPABASE_ANON_KEY;

// Valid URL check
const isValidUrl = (url: string) => {
  try {
    return Boolean(new URL(url));
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  isValidUrl(supabaseUrl) &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
