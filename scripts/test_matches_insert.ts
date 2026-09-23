import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function run() {
  const { data, error } = await supabase.from('matches').insert({
    game_id: 'test',
    status: 'scheduled'
  }).select();
  console.log('Matches insert test:', data, error);
  if (!error && data) {
    await supabase.from('matches').delete().eq('id', data[0].id);
  }
}

run().catch(console.error);
