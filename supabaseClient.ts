
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ghyodlccgtvkcmiryldb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoeW9kbGNjZ3R2a2NtaXJ5bGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNzQyNjUsImV4cCI6MjA4MTg1MDI2NX0.YuTZV5MHavakx6vWBcdxSoveelfv4kkyf5JfF1n-uxc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
