import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function run() {
  const fields = ['id', 'game_id', 'status', 'league_id', 'home_team_id', 'away_team_id', 'kickoff_at', 'home_score', 'away_score', 'external_fixture_id', 'updated_at', 'created_at'];
  for (const f of fields) {
    const id = crypto.randomUUID();
    const payload: any = { id };
    payload[f] = f === 'id' ? id : (f.includes('at') ? new Date().toISOString() : (f.includes('score') ? 0 : 'test'));
    const { data, error } = await supabase.from('matches').insert(payload).select();
    console.log(`Field ${f}:`, error ? error.message : 'OK');
    if (!error && data) {
      await supabase.from('matches').delete().eq('id', id);
    }
  }
}

run().catch(console.error);
