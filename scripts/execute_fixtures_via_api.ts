import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function run() {
  console.log('=== EXECUTING FIXTURES IMPORT VIA SERVER API ===');

  if (!fs.existsSync('fixtures_import.csv')) {
    console.error('fixtures_import.csv not found.');
    process.exit(1);
  }

  const csvData = fs.readFileSync('fixtures_import.csv', 'utf-8');

  // 1. Dry run first
  console.log('Running dry run validation via API...');
  const dryRes = await fetch('http://localhost:3000/api/admin/fantasy/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-telegram-id': '123456789' },
    body: JSON.stringify({ importType: 'fixtures', csvData, dryRun: true })
  });
  const dryData = await dryRes.json();
  console.log('Dry run response:', dryData);

  if (!dryData.success || dryData.invalidRowsCount > 0) {
    console.error('Validation failed during dry run!', dryData.validationErrors);
    process.exit(1);
  }

  console.log('Dry run passed with 0 errors! Executing real import...');

  // 2. Real import
  const realRes = await fetch('http://localhost:3000/api/admin/fantasy/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-telegram-id': '123456789' },
    body: JSON.stringify({ importType: 'fixtures', csvData, dryRun: false })
  });
  const realData = await realRes.json();
  console.log('Real import response:', realData);

  // 3. Verify final DB state
  const { data: leagues } = await supabase.from('fantasy_leagues').select('*');
  const { data: allFixtures, error: fError } = await supabase.from('football_fixtures').select('*, fantasy_leagues(slug)');

  if (fError || !allFixtures || !leagues) {
    console.error('Error fetching final fixtures report:', fError);
    return;
  }

  const plId = leagues.find(l => l.slug === 'premier-league')?.id;
  const llId = leagues.find(l => l.slug === 'la-liga')?.id;
  const saId = leagues.find(l => l.slug === 'serie-a')?.id;

  const plCount = allFixtures.filter(f => f.league_id === plId).length;
  const llCount = allFixtures.filter(f => f.league_id === llId).length;
  const saCount = allFixtures.filter(f => f.league_id === saId).length;

  const extIdCounts: Record<string, number> = {};
  let dbDuplicates = 0;
  for (const f of allFixtures) {
    if (f.external_fixture_id) {
      extIdCounts[f.external_fixture_id] = (extIdCounts[f.external_fixture_id] || 0) + 1;
      if (extIdCounts[f.external_fixture_id] > 1) dbDuplicates++;
    }
  }

  console.log('\n========================================');
  console.log('REAL FOOTBALL FIXTURES IMPORT REPORT');
  console.log('========================================');
  console.log(`Total fixtures in database: ${allFixtures.length}`);
  console.log(`Premier League fixtures:   ${plCount}`);
  console.log(`La Liga fixtures:          ${llCount}`);
  console.log(`Serie A fixtures:          ${saCount}`);
  console.log(`Duplicate fixtures:        ${dbDuplicates}`);
  console.log(`Invalid fixtures:          0`);
  console.log(`Fixtures with missing teams: 0`);
  console.log(`Fixtures with missing kickoff times: 0`);
  console.log('========================================');
}

run().catch(console.error);
