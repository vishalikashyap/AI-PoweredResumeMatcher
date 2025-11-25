import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yvfzvndcsokdppohbuey.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2Znp2bmRjc29rZHBwb2hidWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTMxNTgsImV4cCI6MjA3OTYyOTE1OH0.rCt3zIgD0-Xpefn_4HWCE4edHvnqBQuZVFT4lw8mhIA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
