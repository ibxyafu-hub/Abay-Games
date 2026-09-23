import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || ''
);

async function run() {
  const { data: leagues } = await supabase.from('fantasy_leagues').select('*').limit(1);
  const leagueId = leagues?.[0]?.id;
  const { data: teams } = await supabase.from('fantasy_teams').select('*').limit(1);
  const teamId = teams?.[0]?.id;

  const { data, error } = await supabase.from('fantasy_players').insert({
    league_id: leagueId,
    team_id: teamId,
    name: 'Test Player',
    position: 'FWD',
    price: 10.0
  }).select();
  console.log('Player insert test 2:', data, error);
}

run().catch(console.error);
