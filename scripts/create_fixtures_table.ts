import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `CREATE TABLE IF NOT EXISTS public.football_fixtures (
      id TEXT PRIMARY KEY,
      league_id TEXT NOT NULL,
      home_team_id TEXT NOT NULL,
      away_team_id TEXT NOT NULL,
      kickoff_at TIMESTAMPTZ NOT NULL,
      status TEXT DEFAULT 'scheduled',
      home_score INTEGER DEFAULT 0,
      away_score INTEGER DEFAULT 0,
      external_fixture_id TEXT UNIQUE,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`
  });
  console.log('exec_sql result:', data, error);
}

run().catch(console.error);
