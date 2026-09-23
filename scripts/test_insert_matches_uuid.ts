import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function run() {
  const uuid = crypto.randomUUID();
  console.log('Inserting into matches with UUID:', uuid);
  const { data, error } = await supabase.from('matches').insert({
    id: uuid,
    game_id: 'premier-league',
    status: 'scheduled',
    target_players: 2
  }).select();

  console.log('Matches insert result:', data, error);
  if (!error && data) {
    await supabase.from('matches').delete().eq('id', uuid);
  }
}

run().catch(console.error);
