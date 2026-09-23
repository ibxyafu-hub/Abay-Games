import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || ''
);

async function run() {
  const { data, error } = await supabase.from('football_fixtures').insert({
    id: 'test_fix_123',
    league_id: 'test_l',
    home_team_id: 'test_h',
    away_team_id: 'test_a',
    kickoff_at: new Date().toISOString(),
    status: 'scheduled',
    home_score: 0,
    away_score: 0
  });
  console.log('Insert test result:', error);
  if (!error) {
    await supabase.from('football_fixtures').delete().eq('id', 'test_fix_123');
  }
}

run().catch(console.error);
