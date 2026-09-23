import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const projectRef = 'vjmxghmrwaolyjrpvphd';
  const url = `https://api.supabase.com/v1/projects/${projectRef}/sql`;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      query: `CREATE TABLE IF NOT EXISTS public.football_fixtures (
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
    })
  });

  console.log('Management SQL status:', res.status);
  const text = await res.text();
  console.log('Management SQL body:', text);
}

run().catch(console.error);
