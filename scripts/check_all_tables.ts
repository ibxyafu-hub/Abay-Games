import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function run() {
  const tables = ['fantasy_leagues', 'fantasy_teams', 'fantasy_players', 'football_fixtures', 'fixtures', 'matches', 'match_players', 'fantasy_player_stats'];
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    console.log(`Table ${t}: count = ${count}, error =`, error ? error.message : 'OK');
  }
}

run().catch(console.error);
