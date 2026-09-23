import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function check() {
  const { data: leagues } = await supabase.from('fantasy_leagues').select('*');
  const { data: teams } = await supabase.from('fantasy_teams').select('*');
  console.log('Leagues:', leagues?.length);
  console.log('Teams:', teams?.length);
}
check();
