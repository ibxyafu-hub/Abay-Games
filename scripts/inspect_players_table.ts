import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || ''
);

async function run() {
  const { data, error } = await supabase.from('fantasy_players').insert({
    name: 'Test Player',
    position: 'FWD',
    price: 5.0
  }).select();
  console.log('Player insert test 3:', data, error);
}

run().catch(console.error);
