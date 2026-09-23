import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function run() {
  // Try calling some possible RPCs
  const rpcs = ['get_schema', 'exec_sql', 'run_sql', 'query', 'sql', 'exec', 'eval', 'setup', 'init', 'migrate'];
  for (const rpc of rpcs) {
    const { data, error } = await supabase.rpc(rpc);
    console.log(`RPC ${rpc}:`, error ? error.message : 'SUCCESS');
  }
}

run().catch(console.error);
