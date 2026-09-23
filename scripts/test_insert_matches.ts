import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function run() {
  const { data, error } = await supabase.from('matches').insert({
    id: `match_test_${Date.now()}`,
    status: 'scheduled'
  }).select();

  console.log('Insert into matches result:', data, error);
  if (!error && data) {
    await supabase.from('matches').delete().eq('id', data[0].id);
  }
}

run().catch(console.error);
