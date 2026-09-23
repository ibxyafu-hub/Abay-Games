import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function run() {
  const { data, error } = await (supabase as any).from('information_schema.tables').select('table_name').eq('table_schema', 'public');
  console.log('Tables:', data, error);
}

run().catch(console.error);
