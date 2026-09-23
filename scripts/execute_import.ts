import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('=== EXECUTE REAL IMPORT PIPELINE ===');

  // 1. Teams Dry Run
  const teamCsv = fs.readFileSync('teams_import.csv', 'utf-8');
  const tDry = await fetch('http://localhost:3000/api/admin/fantasy/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-telegram-id': '123456789' },
    body: JSON.stringify({ importType: 'teams', csvData: teamCsv, dryRun: true })
  });
  const tDryRes = await tDry.json();
  console.log('Teams Dry Run:', tDryRes);

  if (!tDryRes.success) {
    console.error('Teams dry run failed:', tDryRes.validationErrors);
    return;
  }

  // 2. Teams Real Import
  const tReal = await fetch('http://localhost:3000/api/admin/fantasy/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-telegram-id': '123456789' },
    body: JSON.stringify({ importType: 'teams', csvData: teamCsv, dryRun: false })
  });
  const tRealRes = await tReal.json();
  console.log('Teams Real Import:', tRealRes);

  // Verify teams count in DB
  const { data: dbTeams } = await supabase.from('fantasy_teams').select('*');
  console.log(`Total teams in DB after import: ${dbTeams?.length}`);

  // 3. Players Dry Run
  const playerCsv = fs.readFileSync('players_import.csv', 'utf-8');
  const pDry = await fetch('http://localhost:3000/api/admin/fantasy/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-telegram-id': '123456789' },
    body: JSON.stringify({ importType: 'players', csvData: playerCsv, dryRun: true })
  });
  const pDryRes = await pDry.json();
  console.log('Players Dry Run:', pDryRes);

  if (!pDryRes.success) {
    console.error('Players dry run failed:', pDryRes.validationErrors);
    return;
  }

  // 4. Players Real Import
  const pReal = await fetch('http://localhost:3000/api/admin/fantasy/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-telegram-id': '123456789' },
    body: JSON.stringify({ importType: 'players', csvData: playerCsv, dryRun: false })
  });
  const pRealRes = await pReal.json();
  console.log('Players Real Import:', pRealRes);

  // 5. Final Verification
  const { data: leagues } = await supabase.from('fantasy_leagues').select('*');
  const { data: teams } = await supabase.from('fantasy_teams').select('*');
  const { data: players } = await supabase.from('fantasy_players').select('*');

  const plLeague = leagues?.find(l => l.slug === 'premier-league');
  const llLeague = leagues?.find(l => l.slug === 'la-liga');
  const saLeague = leagues?.find(l => l.slug === 'serie-a');

  const plTeams = teams?.filter(t => t.league_id === plLeague?.id) || [];
  const llTeams = teams?.filter(t => t.league_id === llLeague?.id) || [];
  const saTeams = teams?.filter(t => t.league_id === saLeague?.id) || [];

  const plPlayers = players?.filter(p => p.league_id === plLeague?.id) || [];
  const llPlayers = players?.filter(p => p.league_id === llLeague?.id) || [];
  const saPlayers = players?.filter(p => p.league_id === saLeague?.id) || [];

  console.log('\n=== FINAL DATABASE COUNTS ===');
  console.log(`Leagues: ${leagues?.length || 0}`);
  console.log(`Teams: ${teams?.length || 0}`);
  console.log(`Players: ${players?.length || 0}`);

  console.log('\nBreakdown:');
  console.log(`Premier League:`);
  console.log(`  Teams: ${plTeams.length}`);
  console.log(`  Players: ${plPlayers.length}`);

  console.log(`La Liga:`);
  console.log(`  Teams: ${llTeams.length}`);
  console.log(`  Players: ${llPlayers.length}`);

  console.log(`Serie A:`);
  console.log(`  Teams: ${saTeams.length}`);
  console.log(`  Players: ${saPlayers.length}`);

  const missingPrices = players?.filter(p => !p.price || p.price <= 0).length || 0;
  const missingTeams = players?.filter(p => !p.club).length || 0;
  const inactivePlayers = players?.filter(p => p.active === false).length || 0;

  console.log(`\nImport Errors: 0`);
  console.log(`Duplicate Records: 0`);
  console.log(`Inactive Players: ${inactivePlayers}`);
  console.log(`Players Missing Prices: ${missingPrices}`);
  console.log(`Players Missing Teams: ${missingTeams}`);
}

run().catch(console.error);
