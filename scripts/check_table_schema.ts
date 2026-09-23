import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || ''
);

async function run() {
  const { data, error } = await supabase.from('fantasy_teams').select('*').limit(1);
  console.log('Sample team:', data, error);
}

run().catch(console.error);
