import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function run() {
  const { data: leagues } = await supabase.from('fantasy_leagues').select('*').limit(1);
  const { data: teams } = await supabase.from('fantasy_teams').select('*').limit(2);

  if (!leagues || leagues.length === 0 || !teams || teams.length < 2) {
    console.error('Leagues or teams not found');
    return;
  }

  const league = leagues[0];
  const home = teams[0];
  const away = teams[1];

  console.log('Inserting test fixture with .insert()...');
  const { data, error } = await supabase.from('football_fixtures').insert({
    id: `fix_test_${Date.now()}`,
    league_id: league.id,
    home_team_id: home.id,
    away_team_id: away.id,
    kickoff_at: new Date().toISOString(),
    status: 'scheduled',
    home_score: 0,
    away_score: 0
  }).select();

  console.log('Result:', data, error);
  if (!error && data) {
    await supabase.from('football_fixtures').delete().eq('id', data[0].id);
  }
}

run().catch(console.error);
