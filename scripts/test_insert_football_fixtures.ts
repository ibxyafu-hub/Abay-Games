import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function run() {
  const { data, error } = await supabase.from('football_fixtures').insert({
    id: 'test_fix_999',
    league_id: 'test',
    home_team_id: 'test',
    away_team_id: 'test',
    kickoff_at: new Date().toISOString(),
    status: 'scheduled'
  }).select();

  console.log('Insert test result:', data, error);
  if (!error && data) {
    await supabase.from('football_fixtures').delete().eq('id', 'test_fix_999');
  }
}

run().catch(console.error);
