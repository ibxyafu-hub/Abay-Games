import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || ''
);

async function run() {
  const { data: tData, error: tErr } = await supabase.from('fantasy_teams').insert({
    name: 'Test Team',
    short_name: 'TST'
  }).select();
  console.log('Team insert test:', tData, tErr);

  const { data: leagues } = await supabase.from('fantasy_leagues').select('*').limit(1);
  const leagueId = leagues?.[0]?.id;
  const { data: teams } = await supabase.from('fantasy_teams').select('*').limit(1);
  const teamName = teams?.[0]?.name || 'Test Team';

  const { data: pData, error: pErr } = await supabase.from('fantasy_players').insert({
    league_id: leagueId,
    club: teamName,
    name: 'Test Player',
    position: 'FWD',
    price: 10.0
  }).select();
  console.log('Player insert test:', pData, pErr);
}

run().catch(console.error);
