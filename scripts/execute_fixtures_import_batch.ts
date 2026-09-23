import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || ''
);

async function run() {
  console.log('=== STARTING BATCHED REAL FOOTBALL FIXTURES IMPORT (2026/27) ===');

  if (!fs.existsSync('fixtures_import.csv')) {
    console.error('Error: fixtures_import.csv not found.');
    process.exit(1);
  }

  const fileContent = fs.readFileSync('fixtures_import.csv', 'utf-8');
  const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values: string[] = [];
    let inQuote = false;
    let currentVal = '';
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        values.push(currentVal.trim().replace(/^"|"$/g, ''));
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim().replace(/^"|"$/g, ''));

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] !== undefined ? values[idx] : '';
    });
    rows.push(rowObj);
  }

  console.log(`Parsed ${rows.length} rows from fixtures_import.csv.`);

  const { data: leagues, error: lError } = await supabase.from('fantasy_leagues').select('*');
  const { data: teams, error: tError } = await supabase.from('fantasy_teams').select('*');

  if (lError || tError || !leagues || !teams) {
    console.error('Error fetching leagues or teams:', lError || tError);
    process.exit(1);
  }

  let invalidCount = 0;
  let duplicateCount = 0;
  let missingTeamsCount = 0;
  let missingKickoffCount = 0;

  const seenInBatch = new Set<string>();
  const validRows: any[] = [];
  const validationErrors: string[] = [];

  rows.forEach((r, idx) => {
    const rowNum = idx + 2;
    const league_slug = r.league_slug;
    const home_team = r.home_team;
    const away_team = r.away_team;
    const kickoff_at = r.kickoff_at;
    const status = r.status || 'scheduled';
    const home_score = r.home_score !== '' ? parseInt(r.home_score, 10) : 0;
    const away_score = r.away_score !== '' ? parseInt(r.away_score, 10) : 0;
    const external_fixture_id = r.external_fixture_id;

    if (!league_slug) {
      validationErrors.push(`Row ${rowNum}: Missing league_slug`);
      invalidCount++;
      return;
    }
    const leagueMatch = leagues.find(l => l.slug === league_slug || l.id === league_slug);
    if (!leagueMatch) {
      validationErrors.push(`Row ${rowNum}: League not found: ${league_slug}`);
      invalidCount++;
      return;
    }

    if (!home_team || !away_team) {
      validationErrors.push(`Row ${rowNum}: Missing teams`);
      missingTeamsCount++;
      invalidCount++;
      return;
    }

    const homeTeamMatch = teams.find(t => t.league_id === leagueMatch.id && t.name.toLowerCase() === home_team.toLowerCase());
    const awayTeamMatch = teams.find(t => t.league_id === leagueMatch.id && t.name.toLowerCase() === away_team.toLowerCase());

    if (!homeTeamMatch || !awayTeamMatch) {
      validationErrors.push(`Row ${rowNum}: Team not found in league ${league_slug} (home: ${home_team}, away: ${away_team})`);
      missingTeamsCount++;
      invalidCount++;
      return;
    }

    if (!kickoff_at || isNaN(Date.parse(kickoff_at))) {
      validationErrors.push(`Row ${rowNum}: Invalid or missing kickoff_at`);
      missingKickoffCount++;
      invalidCount++;
      return;
    }

    const fixKey = `${homeTeamMatch.id}:${awayTeamMatch.id}:${kickoff_at}`;
    const extKey = external_fixture_id ? `ext:${external_fixture_id}` : '';
    if (seenInBatch.has(fixKey) || (extKey && seenInBatch.has(extKey))) {
      validationErrors.push(`Row ${rowNum}: Duplicate fixture`);
      duplicateCount++;
      invalidCount++;
      return;
    }
    seenInBatch.add(fixKey);
    if (extKey) seenInBatch.add(extKey);

    validRows.push({
      id: `fix_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${idx}`,
      league_id: leagueMatch.id,
      home_team_id: homeTeamMatch.id,
      away_team_id: awayTeamMatch.id,
      kickoff_at,
      status,
      home_score,
      away_score,
      external_fixture_id: external_fixture_id || null,
      updated_at: new Date().toISOString()
    });
  });

  console.log(`Validation complete: ${validRows.length} valid rows, ${invalidCount} invalid rows.`);
  if (validationErrors.length > 0) {
    console.log('Sample validation errors:', validationErrors.slice(0, 5));
  }

  if (invalidCount > 0) {
    console.error('ABORTING: Found invalid rows in import batch.');
    process.exit(1);
  }

  // Clear existing football_fixtures if any or upsert in batches of 100
  console.log('Inserting fixtures in batches of 100...');
  let insertedCount = 0;

  const batchSize = 100;
  for (let i = 0; i < validRows.length; i += batchSize) {
    const batch = validRows.slice(i, i + batchSize);
    const { error } = await supabase.from('football_fixtures').upsert(batch, { onConflict: 'external_fixture_id' });
    if (error) {
      console.error(`Batch insert error at index ${i}:`, error);
    } else {
      insertedCount += batch.length;
      console.log(`Successfully inserted batch ${i / batchSize + 1} (${insertedCount}/${validRows.length})`);
    }
  }

  console.log(`Import finished! Total inserted/upserted: ${insertedCount}`);

  // Fetch final database state for report
  const { data: allFixtures, error: fError } = await supabase.from('football_fixtures').select('*, fantasy_leagues(slug)');
  if (fError || !allFixtures) {
    console.error('Error fetching fixtures for report:', fError);
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
