import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = `${process.env.VITE_SUPABASE_URL}/rest/v1/`;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const res = await fetch(url, {
    headers: {
      'apikey': key || '',
      'Authorization': `Bearer ${key}`
    }
  });
  const spec: any = await res.json();
  console.log('games properties:', spec.definitions.games?.properties);
  console.log('matches properties:', spec.definitions.matches?.properties);
  console.log('match_players properties:', spec.definitions.match_players?.properties);
}

run().catch(console.error);
