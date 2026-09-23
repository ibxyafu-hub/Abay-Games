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
  console.log('game_stats properties:', spec.definitions.game_stats?.properties);
}

run().catch(console.error);
