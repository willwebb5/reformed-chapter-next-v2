import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bnprkjidihxgcubkounq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucHJramlkaWh4Z2N1YmtvdW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODA2MDQsImV4cCI6MjA2ODI1NjYwNH0.NbgwVGFPo6qDOOxIdXZQ_uaxkV7qYpo8kkH7ICFp0kQ';

export const supabase = createClient(supabaseUrl, supabaseKey);
